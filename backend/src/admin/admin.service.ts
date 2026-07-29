import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  DeliveryEventSource,
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
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import {
  CreateAdminStoreDto,
  CreateStorePackageDto,
  ConfirmPaymentDto,
  CreateCategoryDto,
  CreateDeliveryEventDto,
  UpdateOrderStatusDto,
  UpdateStorePackageDto,
} from './dto';

const safeOwnerSelect = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  stores() {
    return this.prisma.store.findMany({
      include: {
        owner: { select: safeOwnerSelect },
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
    const phone = dto.ownerPhone.trim().replace(/\s+/g, '');
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
          owner: { select: safeOwnerSelect },
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

  updateStoreStatus(id: string, status: StoreStatus) {
    return this.prisma.store.update({
      where: { id },
      data: { status },
    });
  }

  orders() {
    return this.prisma.order.findMany({
      include: { user: true, store: true, items: true, payment: true, deliveryEvents: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(actorId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const existing = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) throw new NotFoundException('Order not found');

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
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

      return order;
    });
  }

  payments() {
    return this.prisma.payment.findMany({
      include: { order: { include: { store: true, user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirmPayment(id: string, dto: ConfirmPaymentDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
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
      return updated;
    });
  }

  deliveryEvents() {
    return this.prisma.deliveryEvent.findMany({
      include: { order: true, createdBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createDeliveryEvent(actorId: string, dto: CreateDeliveryEventDto) {
    return this.updateOrderStatus(actorId, dto.orderId, {
      status: dto.status,
      note: dto.note,
    });
  }

  users() {
    return this.prisma.user.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }

  updateUserStatus(id: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  reviews() {
    return this.prisma.review.findMany({
      include: { user: true, store: true, product: true, order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  reviewStatus(id: string, status: keyof typeof ReviewStatus) {
    return this.prisma.review.update({
      where: { id },
      data: { status: ReviewStatus[status] },
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
