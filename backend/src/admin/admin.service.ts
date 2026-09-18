import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  DeliveryEventSource,
  NotificationType,
  OrderStatus,
  PaymentStatus,
  ReviewStatus,
  StoreStatus,
  SubscriptionStatus,
  UserRole,
  UserStatus,
  WalletTransactionStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PageQueryDto } from '../common/dto/page-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { safeUserSelect } from '../common/prisma/safe-user-select';
import { normalizeSyrianPhone } from '../auth/phone';
import { slugify } from '../common/utils/slugify';
import { NotificationsService } from '../notifications/notifications.service';
import { SavedStoresService } from '../saved-stores/saved-stores.service';
import {
  CreateAdminStoreDto,
  CreateStorePackageDto,
  ConfirmPaymentDto,
  CreateCategoryDto,
  CreateDeliveryEventDto,
  CreateHomeBannerDto,
  CreatePlatformCouponDto,
  UpdateOrderStatusDto,
  UpdateStorePackageDto,
  UpdateCategoryDto,
  UpdateHomeBannerDto,
} from './dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly savedStores: SavedStoresService,
  ) {}

  stores() {
    return this.prisma.store.findMany({
      include: {
        owner: { select: safeUserSelect },
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE },
          include: { package: true },
          orderBy: { startsAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  packages() {
    return this.prisma.storePackage.findMany({
      orderBy: [{ isActive: 'desc' }, { price: 'asc' }],
    });
  }

  products() {
    return this.prisma.product.findMany({
      include: {
        store: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async banners() {
    try {
      return await this.prisma.homeBanner.findMany({
        include: { product: { include: { images: { orderBy: { position: 'asc' } }, store: true } } },
        orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      });
    } catch (error) {
      this.logger.warn(`Home banners table is not ready yet: ${String(error)}`);
      return [];
    }
  }

  createBanner(dto: CreateHomeBannerDto) {
    return this.prisma.homeBanner.create({
      data: {
        title: dto.title.trim(),
        subtitle: dto.subtitle?.trim() || undefined,
        imageUrl: dto.imageUrl.trim(),
        ctaLabel: dto.ctaLabel?.trim() || undefined,
        targetUrl: dto.targetUrl?.trim() || undefined,
        productId: dto.productId || undefined,
        position: dto.position ?? 0,
        status: dto.status ?? 'ACTIVE',
      },
    });
  }

  async updateBanner(id: string, dto: UpdateHomeBannerDto) {
    const existing = await this.prisma.homeBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Banner not found');

    return this.prisma.homeBanner.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        subtitle: dto.subtitle?.trim() || undefined,
        imageUrl: dto.imageUrl?.trim(),
        ctaLabel: dto.ctaLabel?.trim() || undefined,
        targetUrl: dto.targetUrl?.trim() || undefined,
        productId: dto.productId === undefined ? undefined : dto.productId || null,
        position: dto.position,
        status: dto.status,
      },
    });
  }

  createPackage(dto: CreateStorePackageDto) {
    return this.prisma.storePackage.create({
      data: {
        ...dto,
        name: dto.name.trim(),
        slug: this.uniquePackageSlug(dto.name),
      },
    });
  }

  async updatePackage(id: string, dto: UpdateStorePackageDto) {
    const existing = await this.prisma.storePackage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Store package not found');

    return this.prisma.storePackage.update({
      where: { id },
      data: {
        ...dto,
        name: dto.name?.trim(),
      },
    });
  }

  async createStore(dto: CreateAdminStoreDto) {
    const phone = normalizeSyrianPhone(dto.ownerPhone);
    const [existingUser, storePackage] = await Promise.all([
      this.prisma.user.findFirst({
        where: { phone },
      }),
      this.prisma.storePackage.findFirst({
        where: { id: dto.packageId, isActive: true },
      }),
    ]);

    if (existingUser) throw new BadRequestException('Phone is already registered');
    if (!storePackage) throw new NotFoundException('Store package not found');

    const startsAt = new Date();
    const endsAt = this.addDays(startsAt, storePackage.durationDays);

    return this.prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          phone,
          firstName: dto.ownerFirstName.trim(),
          lastName: dto.ownerLastName.trim(),
          passwordHash: await bcrypt.hash(dto.ownerPassword, 12),
          role: UserRole.MERCHANT,
        },
      });

      return tx.store.create({
        data: {
          ownerId: owner.id,
          name: dto.storeName.trim(),
          slug: this.uniqueSlug(dto.storeName),
          description: dto.description?.trim() || undefined,
          logoUrl: dto.logoUrl?.trim() || undefined,
          bannerUrl: dto.bannerUrl?.trim() || undefined,
          openingTime: dto.openingTime?.trim() || undefined,
          closingTime: dto.closingTime?.trim() || undefined,
          status: StoreStatus.APPROVED,
          subscriptions: {
            create: {
              packageId: storePackage.id,
              startsAt,
              endsAt,
            },
          },
        },
        include: {
          owner: { select: safeUserSelect },
          subscriptions: { include: { package: true } },
        },
      });
    });
  }

  async assignStorePackage(storeId: string, packageId: string) {
    const [store, storePackage] = await Promise.all([
      this.prisma.store.findUnique({ where: { id: storeId } }),
      this.prisma.storePackage.findFirst({ where: { id: packageId, isActive: true } }),
    ]);
    if (!store) throw new NotFoundException('Store not found');
    if (!storePackage) throw new NotFoundException('Store package not found');

    const startsAt = new Date();
    const endsAt = this.addDays(startsAt, storePackage.durationDays);
    return this.prisma.$transaction(async (tx) => {
      await tx.storeSubscription.updateMany({
        where: { storeId, status: SubscriptionStatus.ACTIVE },
        data: { status: SubscriptionStatus.CANCELLED },
      });
      return tx.storeSubscription.create({
        data: { storeId, packageId, startsAt, endsAt },
        include: { package: true },
      });
    });
  }

  createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug: `${slugify(dto.name) || 'category'}-${Date.now().toString(36)}`,
        imageUrl: dto.imageUrl?.trim() || undefined,
      },
    });
  }

  /**
   * Creates a platform/app coupon (storeId null): valid in any approved
   * store. Codes stay unique among platform coupons via a partial index.
   */
  async createPlatformCoupon(dto: CreatePlatformCouponDto) {
    const code = dto.code.trim().toUpperCase();
    if (!code) throw new BadRequestException('Coupon code is required');

    const existing = await this.prisma.coupon.findFirst({
      where: { code, storeId: null },
    });
    if (existing) {
      throw new BadRequestException('Platform coupon code already exists');
    }

    if (dto.startsAt && dto.endsAt && new Date(dto.startsAt) >= new Date(dto.endsAt)) {
      throw new BadRequestException('Coupon start date must be before end date');
    }

    return this.prisma.coupon.create({
      data: {
        storeId: null,
        code,
        type: dto.type,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount,
        maxDiscountAmount: dto.maxDiscountAmount,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        usageLimit: dto.usageLimit,
      },
      include: { store: true },
    });
  }

  platformCoupons() {
    return this.prisma.coupon.findMany({
      where: { storeId: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        imageUrl: dto.imageUrl?.trim(),
      },
    });
  }

  updateStoreStatus(id: string, status: StoreStatus) {
    return this.prisma.store.update({
      where: { id },
      data: { status },
    });
  }

  async orders(query: PageQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = {};

    const [items, total, totalSales, statusCounts] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: { user: { select: safeUserSelect }, store: true, items: true, payment: true, deliveryEvents: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where,
        _sum: { total: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        orderBy: { status: 'asc' },
        _count: true,
      }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      summary: {
        totalOrders: total,
        totalSales: totalSales._sum.total ?? 0,
        statusCounts: statusCounts.reduce(
          (counts, item) => ({ ...counts, [item.status]: item._count }),
          {} as Partial<Record<OrderStatus, number>>,
        ),
      },
    };
  }

  async updateOrderStatus(actorId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const existing = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) throw new NotFoundException('Order not found');

    const order = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: dto.status,
          deliveredAt: dto.status === OrderStatus.DELIVERED ? new Date() : existing.deliveredAt,
        },
        include: { payment: true, items: true, store: true },
      });

      await tx.deliveryEvent.create({
        data: {
          orderId,
          status: dto.status,
          note: dto.note,
          source: DeliveryEventSource.OPS,
          createdById: actorId,
        },
      });

      if (dto.status === OrderStatus.DELIVERED) {
        await tx.walletTransaction.updateMany({
          where: { orderId, status: WalletTransactionStatus.PENDING },
          data: { status: WalletTransactionStatus.AVAILABLE, availableAt: new Date() },
        });
      }

      if (dto.status === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
        await tx.walletTransaction.updateMany({
          where: { orderId },
          data: { status: WalletTransactionStatus.CANCELLED },
        });
      }

      return updated;
    });

    await this.safeNotify(order.userId, {
      type: NotificationType.ORDER,
      title: this.orderStatusTitle(order.status),
      body: `طلبك ${order.number}: ${this.orderStatusTitle(order.status)}`,
      data: { orderId: order.id, status: order.status },
    });

    return order;
  }

  private orderStatusTitle(status: OrderStatus): string {
    const titles: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'قيد المراجعة',
      [OrderStatus.CONFIRMED]: 'تم تأكيد الطلب',
      [OrderStatus.PREPARING]: 'جاري تحضير طلبك',
      [OrderStatus.READY_FOR_PICKUP]: 'طلبك جاهز للاستلام',
      [OrderStatus.OUT_FOR_DELIVERY]: 'طلبك في الطريق إليك',
      [OrderStatus.DELIVERED]: 'تم توصيل طلبك',
      [OrderStatus.CANCELLED]: 'تم إلغاء طلبك',
    };
    return titles[status] ?? status;
  }

  private async safeNotify(
    userId: string,
    input: { type: NotificationType; title: string; body: string; data?: Record<string, string> },
  ) {
    try {
      await this.notifications.createAndPush({ ...input, userId, data: input.data ?? {} });
    } catch (error) {
      this.logger.error(`Push notification failed for user ${userId}: ${String(error)}`);
    }
  }

  async payments(query: PageQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = {};

    const [items, total, statusCounts] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        include: { order: { include: { store: true, user: { select: safeUserSelect } } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
      this.prisma.payment.groupBy({
        by: ['status'],
        where,
        orderBy: { status: 'asc' },
        _count: true,
      }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      summary: {
        statusCounts: statusCounts.reduce(
          (counts, item) => ({ ...counts, [item.status]: item._count }),
          {} as Partial<Record<PaymentStatus, number>>,
        ),
      },
    };
  }

  async confirmPayment(id: string, dto: ConfirmPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: { select: { userId: true, number: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: dto.status,
          transactionReference: dto.transactionReference,
          paidAt: dto.status === PaymentStatus.PAID ? new Date() : payment.paidAt,
        },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: dto.status },
      });
      return updatedPayment;
    });

    if (dto.status !== payment.status) {
      const paid = dto.status === PaymentStatus.PAID;
      const failed = dto.status === PaymentStatus.FAILED || dto.status === PaymentStatus.CANCELLED;

      await this.safeNotify(payment.order.userId, {
        type: NotificationType.PAYMENT,
        title: paid ? 'تم تأكيد الدفع' : failed ? 'مشكلة في الدفع' : 'تحديث على الدفع',
        body: paid
          ? `تم تأكيد دفع الطلب ${payment.order.number}. شكرًا لك!`
          : failed
            ? `تعذر تأكيد الدفع للطلب ${payment.order.number}. يرجى المحاولة مجددًا.`
            : `حالة الدفع للطلب ${payment.order.number} أصبحت ${dto.status}.`,
        data: { orderId: payment.orderId, paymentId: payment.id, status: dto.status },
      });
    }

    return updated;
  }

  deliveryEvents() {
    return this.prisma.deliveryEvent.findMany({
      include: { order: true, createdBy: { select: safeUserSelect } },
      orderBy: { createdAt: 'desc' },
    });
  }

  createDeliveryEvent(actorId: string, dto: CreateDeliveryEventDto) {
    return this.updateOrderStatus(actorId, dto.orderId, {
      status: dto.status,
      note: dto.note,
    });
  }

  async users(query: PageQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  updateUserStatus(id: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async reviews(query: PageQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        include: { user: { select: safeUserSelect }, store: true, product: true, order: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  reviewStatus(id: string, status: keyof typeof ReviewStatus) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id },
        data: { status: ReviewStatus[status] },
      });

      // Keep the store rating aggregates in sync with approved reviews only.
      await this.savedStores.recomputeStoreRating(review.storeId);

      return review;
    });
  }

  private uniqueSlug(value: string) {
    return `${slugify(value) || 'store'}-${Date.now().toString(36)}`;
  }

  private uniquePackageSlug(value: string) {
    return `${slugify(value) || 'package'}-${Date.now().toString(36)}`;
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }
}
