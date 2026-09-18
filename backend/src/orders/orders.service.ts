import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CouponStatus,
  DeliveryEventSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
  NotificationType,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@prisma/client';
import {
  normalizeCouponCode,
  pickCouponForCart,
  validateCouponForOrder,
} from '../common/utils/coupons';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutAddressDto, CheckoutDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { position: 'asc' } }, store: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0 || !cart.storeId) {
      throw new BadRequestException('Cart is empty');
    }

    const stores = new Set(cart.items.map((item) => item.product.storeId));
    if (stores.size !== 1 || !stores.has(cart.storeId)) {
      throw new BadRequestException('Cart can contain products from one store only');
    }

    const address = await this.resolveAddress(userId, dto);
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const subtotal = cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
    const deliveryFee = 0;
    const paymentStatus =
      dto.paymentMethod === PaymentMethod.SHAM_CASH ? PaymentStatus.PENDING : PaymentStatus.UNPAID;

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        if (item.product.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException(`Product is not active: ${item.product.name}`);
        }

        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
            status: ProductStatus.ACTIVE,
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count !== 1) {
          throw new BadRequestException(`Not enough stock for ${item.product.name}`);
        }
      }

      // Final coupon validation INSIDE the transaction: reload, verify
      // scope/status/dates/usage-limit/min-order against committed data, then
      // consume one usage atomically. Two concurrent checkouts can never both
      // take the last remaining usage: the guarded updateMany only matches
      // while usedCount < usageLimit, and the loser gets count === 0.
      let discountTotal = 0;
      if (dto.couponCode) {
        const code = normalizeCouponCode(dto.couponCode);
        const candidates = await tx.coupon.findMany({ where: { code } });
        const coupon = pickCouponForCart(candidates, cart.storeId);

        const check = validateCouponForOrder(coupon, { storeId: cart.storeId, subtotal });
        if (!check.ok) {
          throw new BadRequestException(check.message);
        }

        const now = new Date();
        const consumed = await tx.coupon.updateMany({
          where: {
            id: check.coupon.id,
            status: CouponStatus.ACTIVE,
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
            AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
            ...(check.coupon.usageLimit != null
              ? { usedCount: { lt: check.coupon.usageLimit } }
              : {}),
          },
          data: { usedCount: { increment: 1 } },
        });

        if (consumed.count !== 1) {
          // Lost the race for the last usage (or status flipped concurrently).
          throw new BadRequestException('تم استخدام هذا الكوبون');
        }

        discountTotal = check.discount;
      }

      const total = subtotal + deliveryFee - discountTotal;

      const created = await tx.order.create({
        data: {
          number: this.makeOrderNumber(),
          userId,
          storeId: cart.storeId!,
          addressId: address.id,
          status: OrderStatus.PENDING,
          paymentMethod: dto.paymentMethod,
          paymentStatus,
          subtotal,
          deliveryFee,
          discountTotal,
          total,
          customerName: `${user.firstName} ${user.lastName}`,
          customerPhone: address.phone,
          city: address.governorate || address.city,
          // Full snapshot of the delivery info at order time: historical orders
          // must not depend on the mutable Address row after edits/deletes.
          addressLine: [
            address.line1 || [address.area, address.street].filter(Boolean).join(' - '),
            address.building,
            address.floor ? `الطابق ${address.floor}` : '',
            address.additionalInfo,
            address.line2,
          ]
            .map((part) => (part || '').trim())
            .filter(Boolean)
            .join(', '),
          notes: dto.notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productImageUrl: item.product.images[0]?.url,
              unitPrice: item.product.price,
              quantity: item.quantity,
              lineTotal: item.product.price * item.quantity,
            })),
          },
          payment: {
            create: {
              method: dto.paymentMethod,
              status: paymentStatus,
              amount: total,
              provider: dto.paymentMethod === PaymentMethod.SHAM_CASH ? 'SHAM_CASH' : null,
              providerReference: dto.shamCashReference,
            },
          },
          deliveryEvents: {
            create: {
              status: OrderStatus.PENDING,
              source: DeliveryEventSource.SYSTEM,
              note: 'Order created',
            },
          },
          walletTransactions: {
            create: {
              storeId: cart.storeId!,
              type: WalletTransactionType.SALE,
              status: WalletTransactionStatus.PENDING,
              amount: total,
              description: 'Pending sale amount',
            },
          },
        },
        include: this.orderInclude(),
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { storeId: null } });

      return created;
    });

    await this.notifications.createAndPush({
      userId,
      type: NotificationType.ORDER,
      title: 'تم إنشاء الطلب',
      body: `طلبك ${order.number} قيد المراجعة.`,
      data: {
        orderId: order.id,
        orderNumber: order.number,
        screen: 'orders',
      },
    });

    return order;
  }

  myOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: this.orderInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderForCustomer(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: this.orderInclude(),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async confirmDelivery(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, userId } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.DELIVERED) {
      return this.getOrderForCustomer(userId, id);
    }

    if (
      order.status !== OrderStatus.OUT_FOR_DELIVERY &&
      order.status !== OrderStatus.READY_FOR_PICKUP
    ) {
      throw new BadRequestException('Order is not ready to be confirmed yet');
    }

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.DELIVERED, deliveredAt: new Date() },
      include: this.orderInclude(),
    });

    await this.notifications.createAndPush({
      userId,
      type: NotificationType.ORDER,
      title: 'تم الاستلام',
      body: `تم تأكيد استلام طلبك ${order.number}. شكرًا لتسوقك معنا!`,
      data: {
        orderId: order.id,
        orderNumber: order.number,
        screen: 'orders',
      },
    });

    return updated;
  }

  private async resolveAddress(userId: string, dto: CheckoutDto) {
    if (dto.addressId) {
      const address = await this.prisma.address.findFirst({
        where: { id: dto.addressId, userId },
      });
      if (!address) throw new NotFoundException('Address not found');
      return address;
    }

    if (!dto.address) {
      throw new BadRequestException('Address is required');
    }

    return this.createAddress(userId, dto.address);
  }

  private createAddress(userId: string, address: CheckoutAddressDto) {
    return this.prisma.address.create({
      data: {
        userId,
        label: address.label,
        city: address.city,
        line1: address.line1,
        line2: address.line2,
        phone: address.phone,
        governorate: address.governorate,
        area: address.area,
        street: address.street,
        building: address.building,
        floor: address.floor,
        additionalInfo: address.additionalInfo,
        latitude: address.latitude,
        longitude: address.longitude,
      },
    });
  }

  private makeOrderNumber() {
    const year = new Date().getFullYear();
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-8);
    return `KH-${year}-${suffix}`;
  }

  private orderInclude() {
    return {
      store: true,
      items: true,
      payment: true,
      deliveryEvents: { orderBy: { createdAt: 'asc' as const } },
    };
  }
}
