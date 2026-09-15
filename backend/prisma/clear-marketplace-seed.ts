import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seedStore = await prisma.store.findUnique({
    where: { slug: 'smart-store' },
    select: { id: true },
  });

  const seedProducts = await prisma.product.findMany({
    where: { slug: { in: ['smart-watch', 'office-gift-box'] } },
    select: { id: true },
  });
  const seedProductIds = seedProducts.map((product) => product.id);

  await prisma.$transaction([
    prisma.reel.deleteMany({
      where: {
        OR: [
          { title: 'Smart watch offer' },
          ...(seedStore ? [{ storeId: seedStore.id }] : []),
        ],
      },
    }),
    prisma.coupon.deleteMany({
      where: {
        OR: [
          { code: 'KHAN10' },
          ...(seedStore ? [{ storeId: seedStore.id }] : []),
        ],
      },
    }),
    prisma.productImage.deleteMany({ where: { productId: { in: seedProductIds } } }),
    prisma.cartItem.deleteMany({ where: { productId: { in: seedProductIds } } }),
    prisma.favorite.deleteMany({ where: { productId: { in: seedProductIds } } }),
    prisma.review.deleteMany({
      where: {
        OR: [
          { productId: { in: seedProductIds } },
          ...(seedStore ? [{ storeId: seedStore.id }] : []),
        ],
      },
    }),
    prisma.product.deleteMany({ where: { id: { in: seedProductIds } } }),
    prisma.store.deleteMany({ where: { slug: 'smart-store' } }),
    prisma.category.deleteMany({ where: { slug: { in: ['electronics', 'gifts'] } } }),
    prisma.address.deleteMany({ where: { id: 'seed-address-damascus' } }),
    prisma.cart.deleteMany({ where: { user: { phone: '+963999000002' } } }),
    prisma.user.deleteMany({ where: { phone: { in: ['+963999000001', '+963999000002'] } } }),
  ]);

  console.log('Marketplace seed data cleared.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
