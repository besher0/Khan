import { Injectable, NotFoundException } from '@nestjs/common';
import { CouponStatus, ProductStatus, ReelStatus, ReviewStatus, StoreStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductQueryDto, SearchQueryDto } from './dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async home() {
    const [categories, featuredProducts, latestReels, coupons] = await Promise.all([
      this.categories(),
      this.prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          isFeatured: true,
          store: { status: StoreStatus.APPROVED },
        },
        include: this.productInclude(),
        take: 12,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reel.findMany({
        where: { status: ReelStatus.ACTIVE, store: { status: StoreStatus.APPROVED } },
        include: { store: true, product: { include: { images: true } } },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.findMany({
        where: { status: CouponStatus.ACTIVE, store: { status: StoreStatus.APPROVED } },
        include: { store: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { categories, featuredProducts, latestReels, coupons };
  }

  categories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async products(query: ProductQueryDto) {
    const where = {
      status: ProductStatus.ACTIVE,
      store: { status: StoreStatus.APPROVED },
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.storeId ? { storeId: query.storeId } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { description: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: this.productInclude(),
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, skip: query.skip, take: query.take };
  }

  async product(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        status: ProductStatus.ACTIVE,
        store: { status: StoreStatus.APPROVED },
      },
      include: {
        ...this.productInclude(),
        reviews: {
          where: { status: ReviewStatus.APPROVED },
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async store(id: string) {
    const store = await this.prisma.store.findFirst({
      where: { id, status: StoreStatus.APPROVED },
      include: {
        category: true,
        coupons: { where: { status: CouponStatus.ACTIVE }, take: 10 },
        reviews: {
          where: { status: ReviewStatus.APPROVED },
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async search(query: SearchQueryDto) {
    const q = query.q.trim();
    const [products, stores, reels] = await Promise.all([
      this.products({ q, skip: query.skip, take: query.take }),
      this.prisma.store.findMany({
        where: {
          status: StoreStatus.APPROVED,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { category: true },
        take: query.take,
        skip: query.skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reel.findMany({
        where: {
          status: ReelStatus.ACTIVE,
          store: { status: StoreStatus.APPROVED },
          title: { contains: q, mode: 'insensitive' },
        },
        include: { store: true, product: { include: { images: true } } },
        take: query.take,
        skip: query.skip,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { products: products.items, stores, reels };
  }

  async reels(query: ProductQueryDto) {
    const where = {
      status: ReelStatus.ACTIVE,
      store: { status: StoreStatus.APPROVED },
      ...(query.storeId ? { storeId: query.storeId } : {}),
      ...(query.q ? { title: { contains: query.q, mode: 'insensitive' as const } } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.reel.findMany({
        where,
        include: { store: true, product: { include: { images: true } } },
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reel.count({ where }),
    ]);

    return { items, total, skip: query.skip, take: query.take };
  }

  async coupons(query: ProductQueryDto) {
    const where = {
      status: CouponStatus.ACTIVE,
      store: { status: StoreStatus.APPROVED },
      ...(query.storeId ? { storeId: query.storeId } : {}),
      ...(query.q ? { code: { contains: query.q, mode: 'insensitive' as const } } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        include: { store: true },
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return { items, total, skip: query.skip, take: query.take };
  }

  private productInclude() {
    return {
      store: true,
      category: true,
      images: { orderBy: { position: 'asc' as const } },
    };
  }
}
