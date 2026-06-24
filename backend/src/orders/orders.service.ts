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
  WalletTransactionStatus,
  WalletTransactionType,
} from '@prisma/client';
import { calculateCouponDiscount } from '../common/utils/coupons';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutAddressDto, CheckoutDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

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
    const coupon = dto.couponCode
      ? await this.findValidCoupon(cart.storeId, dto.couponCode, subtotal)
      : null;
    const discountTotal = calculateCouponDiscount(coupon, subtotal);
    const deliveryFee = 0;
    const total = subtotal + deliveryFee - discountTotal;
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

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

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
          city: address.city,
          addressLine: [address.line1, address.line2].filter(Boolean).join(', '),
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
      },
    });
  }

  private async findValidCoupon(storeId: string, code: string, subtotal: number) {
    const now = new Date();
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        storeId,
        code: code.trim().toUpperCase(),
        status: CouponStatus.ACTIVE,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
    });

    if (!coupon) {
      throw new BadRequestException('Coupon is invalid or expired');
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new BadRequestException('Order does not meet coupon minimum amount');
    }

    return coupon;
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
