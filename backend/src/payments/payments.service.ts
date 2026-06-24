import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ShamCashCallbackDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initiateShamCash(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.paymentMethod !== PaymentMethod.SHAM_CASH || !order.payment) {
      throw new BadRequestException('Order is not payable via Sham Cash');
    }
    if (order.payment.status === PaymentStatus.PAID) {
      return { payment: order.payment, message: 'Payment is already completed' };
    }

    const providerReference =
      order.payment.providerReference ?? `SC-${order.number}-${Date.now()}`;
    const payment = await this.prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        provider: 'SHAM_CASH',
        providerReference,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      payment,
      instructions: {
        provider: 'SHAM_CASH',
        amount: order.total,
        currency: 'SYP',
        reference: providerReference,
        note: 'Use this reference in Sham Cash, then callback/manual confirmation marks it as paid.',
      },
    };
  }

  async applyShamCashCallback(dto: ShamCashCallbackDto) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        provider: 'SHAM_CASH',
        providerReference: dto.providerReference,
      },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const paid = dto.status === PaymentStatus.PAID;
    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: dto.status,
          transactionReference: dto.transactionReference,
          payload: dto.payload,
          paidAt: paid ? new Date() : payment.paidAt,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: dto.status },
      });

      return updatedPayment;
    });
  }
}
