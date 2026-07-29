import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CouponStatus,
  Prisma,
  ProductStatus,
  ReelStatus,
  StoreStatus,
  SubscriptionStatus,
} from '@prisma/client';
import { slugify } from '../common/utils/slugify';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCouponDto,
  CreateProductDto,
  CreateReelDto,
  UpdateCouponDto,
  UpdateProductDto,
  UpdateReelDto,
  UpdateStoreDto,
  UpsertStoreDto,
} from './dto';

@Injectable()
export class MerchantService {
  constructor(private readonly prisma: PrismaService) {}

  async getStore(userId: string) {
    const store = await this.prisma.store.findFirst({
      where: { ownerId: userId },
      include: {
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE },
          include: { package: true },
          orderBy: { startsAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!store) throw new NotFoundException('Merchant store not found');
    return store;
  }

  async createStore(userId: string, dto: UpsertStoreDto) {
    const existing = await this.prisma.store.findFirst({ where: { ownerId: userId } });
    if (existing) {
      throw new BadRequestException('Merchant already has a store');
    }

    const storePackage = await this.prisma.storePackage.findFirst({
      where: { slug: 'basic', isActive: true },
    });
    if (!storePackage) throw new BadRequestException('Basic store package is not configured');
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setUTCDate(endsAt.getUTCDate() + storePackage.durationDays);

    return this.prisma.store.create({
      data: {
        ownerId: userId,
        name: dto.name,
        slug: this.uniqueSlug(dto.name),
        description: dto.description,
        logoUrl: dto.logoUrl,
        bannerUrl: dto.bannerUrl,
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
        status: StoreStatus.PENDING,
        subscriptions: {
          create: { packageId: storePackage.id, startsAt, endsAt },
        },
      },
    });
  }

  async updateStore(userId: string, dto: UpdateStoreDto) {
    const store = await this.requireStore(userId);
    return this.prisma.store.update({
      where: { id: store.id },
      data: {
        name: dto.name,
        description: dto.description,
        logoUrl: dto.logoUrl,
        bannerUrl: dto.bannerUrl,
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
      },
    });
  }

  async products(userId: string) {
    const store = await this.requireStore(userId);
    return this.prisma.product.findMany({
      where: { storeId: store.id },
      include: { category: true, images: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(userId: string, dto: CreateProductDto) {
    const store = await this.requireStore(userId);
    await this.requirePackageCapacity(store.id, 'products');
    return this.prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: dto.categoryId,
        name: dto.name,
        slug: this.uniqueSlug(dto.name),
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        status: dto.status ?? ProductStatus.DRAFT,
        freeDelivery: dto.freeDelivery ?? false,
        images: this.imageCreate(dto.imageUrls),
      },
      include: { images: true, category: true },
    });
  }

  async updateProduct(userId: string, productId: string, dto: UpdateProductDto) {
    const store = await this.requireStore(userId);
    await this.requireProduct(store.id, productId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.imageUrls) {
        await tx.productImage.deleteMany({ where: { productId } });
      }

      return tx.product.update({
        where: { id: productId },
        data: {
          categoryId: dto.categoryId,
          name: dto.name,
          description: dto.description,
          price: dto.price,
          stock: dto.stock,
          status: dto.status,
          freeDelivery: dto.freeDelivery,
          ...(dto.name ? { slug: this.uniqueSlug(dto.name) } : {}),
          ...(dto.imageUrls ? { images: this.imageCreate(dto.imageUrls) } : {}),
        },
        include: { images: true, category: true },
      });
    });
  }

  async archiveProduct(userId: string, productId: string) {
    const store = await this.requireStore(userId);
    await this.requireProduct(store.id, productId);
    return this.prisma.product.update({
      where: { id: productId },
      data: { status: ProductStatus.ARCHIVED },
    });
  }

  async orders(userId: string) {
    const store = await this.requireStore(userId);
    return this.prisma.order.findMany({
      where: { storeId: store.id },
      include: { user: true, items: true, payment: true, deliveryEvents: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async coupons(userId: string) {
    const store = await this.requireStore(userId);
    return this.prisma.coupon.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCoupon(userId: string, dto: CreateCouponDto) {
    const store = await this.requireStore(userId);
    await this.requirePackageCapacity(store.id, 'coupons');
    return this.prisma.coupon.create({
      data: {
        storeId: store.id,
        code: dto.code.trim().toUpperCase(),
        type: dto.type,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount,
        maxDiscountAmount: dto.maxDiscountAmount,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        usageLimit: dto.usageLimit,
      },
    });
  }

  async updateCoupon(userId: string, couponId: string, dto: UpdateCouponDto) {
    const store = await this.requireStore(userId);
    const coupon = await this.prisma.coupon.findFirst({
      where: { id: couponId, storeId: store.id },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');

    return this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        status: dto.status,
        value: dto.value,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
    });
  }

  async reels(userId: string) {
    const store = await this.requireStore(userId);
    return this.prisma.reel.findMany({
      where: { storeId: store.id },
      include: { product: { include: { images: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createReel(userId: string, dto: CreateReelDto) {
    const store = await this.requireStore(userId);
    await this.requirePackageCapacity(store.id, 'reels');
    if (dto.productId) await this.requireProduct(store.id, dto.productId);
    return this.prisma.reel.create({
      data: {
        storeId: store.id,
        productId: dto.productId,
        title: dto.title,
        videoUrl: dto.videoUrl,
        thumbnailUrl: dto.thumbnailUrl,
        status: dto.status,
      },
    });
  }

  async updateReel(userId: string, reelId: string, dto: UpdateReelDto) {
    const store = await this.requireStore(userId);
    const reel = await this.prisma.reel.findFirst({ where: { id: reelId, storeId: store.id } });
    if (!reel) throw new NotFoundException('Reel not found');
    if (dto.productId) await this.requireProduct(store.id, dto.productId);

    return this.prisma.reel.update({
      where: { id: reelId },
      data: dto,
    });
  }

  async wallet(userId: string) {
    const store = await this.requireStore(userId);
    const [transactions, totals] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { storeId: store.id },
        include: { order: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.walletTransaction.groupBy({
        by: ['status'],
        where: { storeId: store.id },
        _sum: { amount: true },
      }),
    ]);

    return { transactions, totals };
  }

  private async requireStore(userId: string) {
    const store = await this.prisma.store.findFirst({ where: { ownerId: userId } });
    if (!store) throw new NotFoundException('Merchant store not found');
    return store;
  }

  private async requireProduct(storeId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, storeId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private async requirePackageCapacity(
    storeId: string,
    resource: 'products' | 'reels' | 'coupons',
  ) {
    const subscription = await this.prisma.storeSubscription.findFirst({
      where: {
        storeId,
        status: SubscriptionStatus.ACTIVE,
        endsAt: { gt: new Date() },
      },
      include: { package: true },
      orderBy: { startsAt: 'desc' },
    });
    if (!subscription) {
      throw new BadRequestException('اشتراك المتجر غير موجود أو منتهي');
    }

    const config = {
      products: {
        limit: subscription.package.maxProducts,
        count: () => this.prisma.product.count({
          where: { storeId, status: { not: ProductStatus.ARCHIVED } },
        }),
        label: 'المنتجات',
      },
      reels: {
        limit: subscription.package.maxReels,
        count: () => this.prisma.reel.count({
          where: { storeId, status: { not: ReelStatus.ARCHIVED } },
        }),
        label: 'الريلز',
      },
      coupons: {
        limit: subscription.package.maxCoupons,
        count: () => this.prisma.coupon.count({
          where: { storeId, status: CouponStatus.ACTIVE },
        }),
        label: 'الكوبونات النشطة',
      },
    }[resource];

    if ((await config.count()) >= config.limit) {
      throw new BadRequestException(
        `وصل المتجر إلى حد ${config.label} في باقة ${subscription.package.name}`,
      );
    }
  }

  private uniqueSlug(value: string) {
    return `${slugify(value) || 'item'}-${Date.now().toString(36)}`;
  }

  private imageCreate(imageUrls?: string[]): Prisma.ProductImageCreateNestedManyWithoutProductInput {
    return {
      create: (imageUrls ?? []).map((url, position) => ({ url, position })),
    };
  }
}
