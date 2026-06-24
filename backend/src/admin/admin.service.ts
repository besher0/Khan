import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeliveryEventSource,
  OrderStatus,
  PaymentStatus,
  ReviewStatus,
  StoreStatus,
  UserStatus,
  WalletTransactionStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConfirmPaymentDto,
  CreateDeliveryEventDto,
  UpdateOrderStatusDto,
} from './dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  stores() {
    return this.prisma.store.findMany({
      include: { owner: true, category: true },
      orderBy: { createdAt: 'desc' },
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
}
