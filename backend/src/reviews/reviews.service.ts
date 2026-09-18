import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto';
import { ReviewSort } from './review-sort';

const reviewAuthorSelect = { select: { firstName: true, lastName: true } } as const;

type ReviewRow = Prisma.ReviewGetPayload<{
  include: { user: { select: { firstName: true; lastName: true } } };
}>;

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

    const duplicate = await this.prisma.review.findFirst({
      where: {
        userId,
        orderId: order.id,
        productId: dto.productId ?? null,
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new BadRequestException('You already reviewed this order');
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

  async storeReviews(storeId: string, sort?: ReviewSort) {
    const [reviews, summary] = await Promise.all([
      this.prisma.review.findMany({
        where: { storeId, status: ReviewStatus.APPROVED },
        include: { user: reviewAuthorSelect },
        orderBy: this.orderBy(sort),
        take: 60,
      }),
      this.storeSummary(storeId),
    ]);

    return { items: reviews, ...summary };
  }

  async storeReviewEligibility(userId: string, storeId: string) {
    const deliveredOrder = await this.prisma.order.findFirst({
      where: { userId, storeId, status: OrderStatus.DELIVERED },
      orderBy: { createdAt: 'desc' },
      include: { reviews: { where: { productId: null }, select: { id: true } } },
    });

    return {
      eligible: Boolean(deliveredOrder),
      reason: deliveredOrder ? null : 'STORE_DELIVERED_ORDER_REQUIRED',
      alreadyReviewed: Boolean(deliveredOrder?.reviews.length),
      order: deliveredOrder
        ? {
            id: deliveredOrder.id,
            number: deliveredOrder.number,
            deliveredAt: deliveredOrder.deliveredAt,
          }
        : null,
    };
  }

  async productReviews(productId: string, sort?: ReviewSort) {
    const [reviews, summary] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId, status: ReviewStatus.APPROVED },
        include: { user: reviewAuthorSelect },
        orderBy: this.orderBy(sort),
        take: 60,
      }),
      this.productSummary(productId),
    ]);

    return { items: reviews, ...summary };
  }

  async productReviewEligibility(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const deliveredOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.DELIVERED,
        items: { some: { productId } },
      },
      orderBy: { createdAt: 'desc' },
      include: { reviews: { where: { productId }, select: { id: true } } },
    });

    return {
      eligible: Boolean(deliveredOrder),
      reason: deliveredOrder ? null : 'PRODUCT_DELIVERED_ORDER_REQUIRED',
      alreadyReviewed: Boolean(deliveredOrder?.reviews.length),
      order: deliveredOrder
        ? {
            id: deliveredOrder.id,
            number: deliveredOrder.number,
            deliveredAt: deliveredOrder.deliveredAt,
          }
        : null,
    };
  }

  private async storeSummary(storeId: string) {
    const grouping = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { storeId, status: ReviewStatus.APPROVED },
      _count: true,
    });

    return this.summarize(grouping);
  }

  private async productSummary(productId: string) {
    const grouping = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { productId, status: ReviewStatus.APPROVED },
      _count: true,
    });

    return this.summarize(grouping);
  }

  private summarize(grouping: Array<{ rating: number; _count: number }>) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    let total = 0;
    let weighted = 0;

    for (const row of grouping) {
      const count = Number(row._count) || 0;
      distribution[row.rating] = count;
      total += count;
      weighted += count * row.rating;
    }

    return {
      total,
      average: total ? Math.round((weighted / total) * 10) / 10 : 0,
      distribution,
    };
  }

  private orderBy(sort?: ReviewSort): Prisma.ReviewOrderByWithRelationInput[] {
    switch (sort) {
      case ReviewSort.OLDEST:
        return [{ createdAt: 'asc' }];
      case ReviewSort.HIGHEST:
        return [{ rating: 'desc' }, { createdAt: 'desc' }];
      case ReviewSort.LOWEST:
        return [{ rating: 'asc' }, { createdAt: 'desc' }];
      case ReviewSort.LATEST:
      default:
        return [{ createdAt: 'desc' }];
    }
  }
}
