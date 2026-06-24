import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, userId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Reviews are allowed only after delivery');
    }
    if (dto.productId && !order.items.some((item) => item.productId === dto.productId)) {
      throw new BadRequestException('Product was not part of this order');
    }

    return this.prisma.review.create({
      data: {
        userId,
        orderId: order.id,
        storeId: order.storeId,
        productId: dto.productId,
        rating: dto.rating,
        comment: dto.comment,
        imageUrls: dto.imageUrls ?? [],
        status: ReviewStatus.PENDING,
      },
    });
  }

  storeReviews(storeId: string) {
    return this.prisma.review.findMany({
      where: { storeId, status: ReviewStatus.APPROVED },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  productReviews(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, status: ReviewStatus.APPROVED },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
