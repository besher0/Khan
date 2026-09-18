import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus, StoreStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const savedStoreInclude = Prisma.validator<Prisma.SavedStoreInclude>()({
  store: {
    include: {
      _count: { select: { products: { where: { status: ProductStatus.ACTIVE } } } },
    },
  },
});

@Injectable()
export class SavedStoresService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.savedStore.findMany({
      where: { userId },
      include: savedStoreInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, status: StoreStatus.APPROVED },
    });
    if (!store) throw new NotFoundException('Store not found');

    await this.prisma.savedStore.upsert({
      where: { userId_storeId: { userId, storeId } },
      create: { userId, storeId },
      update: {},
    });

    return { ok: true, storeId };
  }

  async remove(userId: string, storeId: string) {
    await this.prisma.savedStore.deleteMany({
      where: { userId, storeId },
    });
    return { ok: true, storeId };
  }

  async isSaved(userId: string, storeId: string) {
    const saved = await this.prisma.savedStore.findUnique({
      where: { userId_storeId: { userId, storeId } },
      select: { storeId: true },
    });
    return { storeId, saved: Boolean(saved) };
  }

  /**
   * Recomputes a store rating from its APPROVED reviews.
   * Called whenever a review is approved so store cards show real data.
   */
  async recomputeStoreRating(storeId: string) {
    const aggregate = await this.prisma.review.aggregate({
      where: { storeId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    });

    const ratingAvg = Number((aggregate._avg.rating ?? 0).toFixed(2));
    const ratingCount = aggregate._count;

    return this.prisma.store.update({
      where: { id: storeId },
      data: { ratingAvg, ratingCount },
      select: { id: true, ratingAvg: true, ratingCount: true },
    });
  }
}
