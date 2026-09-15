CREATE TYPE "HomeBannerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE "HomeBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "ctaLabel" TEXT,
    "targetUrl" TEXT,
    "productId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "status" "HomeBannerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeBanner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HomeBanner_status_idx" ON "HomeBanner"("status");

CREATE INDEX "HomeBanner_position_idx" ON "HomeBanner"("position");

CREATE INDEX "HomeBanner_productId_idx" ON "HomeBanner"("productId");

ALTER TABLE "HomeBanner" ADD CONSTRAINT "HomeBanner_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
