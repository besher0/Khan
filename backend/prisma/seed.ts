import {
  CouponType,
  PaymentMethod,
  ProductStatus,
  ReelStatus,
  StoreStatus,
  UserRole,
} from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const [admin, ops, merchant, customer] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@khan.local' },
      update: {},
      create: {
        email: 'admin@khan.local',
        phone: '0990000001',
        firstName: 'Khan',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: 'ops@khan.local' },
      update: {},
      create: {
        email: 'ops@khan.local',
        phone: '0990000002',
        firstName: 'Khan',
        lastName: 'Ops',
        role: UserRole.OPS,
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: 'merchant@khan.local' },
      update: {},
      create: {
        email: 'merchant@khan.local',
        phone: '0999000001',
        firstName: 'Ahmad',
        lastName: 'Merchant',
        role: UserRole.MERCHANT,
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: 'customer@khan.local' },
      update: {},
      create: {
        email: 'customer@khan.local',
        phone: '0999000002',
        firstName: 'Sara',
        lastName: 'Customer',
        role: UserRole.CUSTOMER,
        passwordHash,
      },
    }),
  ]);

  await prisma.address.upsert({
    where: { id: 'seed-address-damascus' },
    update: {},
    create: {
      id: 'seed-address-damascus',
      userId: customer.id,
      label: 'Home',
      city: 'Damascus',
      line1: 'Malki, main street',
      phone: '0999000002',
      isDefault: true,
    },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      imageUrl: '/uploads/categories/electronics.jpg',
    },
  });

  const gifts = await prisma.category.upsert({
    where: { slug: 'gifts' },
    update: {},
    create: {
      name: 'Gifts',
      slug: 'gifts',
      imageUrl: '/uploads/categories/gifts.jpg',
    },
  });

  const store = await prisma.store.upsert({
    where: { slug: 'smart-store' },
    update: {},
    create: {
      ownerId: merchant.id,
      name: 'Smart Store',
      slug: 'smart-store',
      description: 'Approved demo electronics store for Khan.',
      bannerUrl: '/uploads/stores/smart-store-banner.jpg',
      logoUrl: '/uploads/stores/smart-store-logo.jpg',
      status: StoreStatus.APPROVED,
      openingTime: '09:00',
      closingTime: '23:00',
    },
  });

  const watch = await prisma.product.upsert({
    where: { storeId_slug: { storeId: store.id, slug: 'smart-watch' } },
    update: {},
    create: {
      storeId: store.id,
      categoryId: electronics.id,
      name: 'Smart Watch',
      slug: 'smart-watch',
      description: 'Daily smart watch with free delivery.',
      price: 50000,
      stock: 25,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      freeDelivery: true,
      images: {
        create: [{ url: '/uploads/products/smart-watch.jpg', position: 0 }],
      },
    },
  });

  const gift = await prisma.product.upsert({
    where: { storeId_slug: { storeId: store.id, slug: 'office-gift-box' } },
    update: {},
    create: {
      storeId: store.id,
      categoryId: gifts.id,
      name: 'Office Gift Box',
      slug: 'office-gift-box',
      description: 'Premium office gift set.',
      price: 75000,
      stock: 15,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      images: {
        create: [{ url: '/uploads/products/gift-box.jpg', position: 0 }],
      },
    },
  });

  await prisma.coupon.upsert({
    where: { storeId_code: { storeId: store.id, code: 'KHAN10' } },
    update: {},
    create: {
      storeId: store.id,
      code: 'KHAN10',
      type: CouponType.PERCENT,
      value: 10,
      maxDiscountAmount: 10000,
      status: 'ACTIVE',
    },
  });

  await prisma.reel.create({
    data: {
      storeId: store.id,
      productId: watch.id,
      title: 'Smart watch offer',
      videoUrl: '/uploads/reels/smart-watch.mp4',
      thumbnailUrl: '/uploads/reels/smart-watch.jpg',
      status: ReelStatus.ACTIVE,
    },
  });

  await prisma.cart.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id },
  });

  console.log({ admin: admin.email, ops: ops.email, merchant: merchant.email, customer: customer.email, seededProducts: [watch.id, gift.id] });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
