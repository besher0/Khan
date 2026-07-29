-- Store categories belong to products, not to the store itself.
ALTER TABLE "Store" DROP CONSTRAINT "Store_categoryId_fkey";
ALTER TABLE "Store" DROP COLUMN "categoryId";

CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

CREATE TABLE "StorePackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "maxProducts" INTEGER NOT NULL,
    "maxReels" INTEGER NOT NULL,
    "maxCoupons" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StorePackage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreSubscription" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StoreSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StorePackage_slug_key" ON "StorePackage"("slug");
CREATE INDEX "StorePackage_isActive_idx" ON "StorePackage"("isActive");
CREATE INDEX "StoreSubscription_storeId_status_idx" ON "StoreSubscription"("storeId", "status");
CREATE INDEX "StoreSubscription_packageId_idx" ON "StoreSubscription"("packageId");
CREATE INDEX "StoreSubscription_endsAt_idx" ON "StoreSubscription"("endsAt");

ALTER TABLE "StoreSubscription" ADD CONSTRAINT "StoreSubscription_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreSubscription" ADD CONSTRAINT "StoreSubscription_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "StorePackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "StorePackage" ("id", "name", "slug", "price", "durationDays", "maxProducts", "maxReels", "maxCoupons", "updatedAt") VALUES
('package-basic', 'الأساسية', 'basic', 0, 30, 25, 5, 3, CURRENT_TIMESTAMP),
('package-pro', 'الاحترافية', 'pro', 150000, 30, 100, 25, 15, CURRENT_TIMESTAMP),
('package-premium', 'المميزة', 'premium', 300000, 30, 500, 100, 50, CURRENT_TIMESTAMP);

INSERT INTO "StoreSubscription" ("id", "storeId", "packageId", "startsAt", "endsAt", "updatedAt")
SELECT 'subscription-' || "id", "id", 'package-basic', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP
FROM "Store";
