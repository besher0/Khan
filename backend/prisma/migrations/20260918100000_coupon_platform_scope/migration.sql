-- Make Coupon.storeId nullable so a coupon can be a platform/app coupon
-- (كوبونات التطبيق) that is not bound to any single store.
ALTER TABLE "Coupon" ALTER COLUMN "storeId" DROP NOT NULL;

-- Postgres treats NULLs as distinct in the existing composite unique index
-- ("Coupon_storeId_code_key"), so platform coupon codes would not be covered.
-- Enforce uniqueness among platform coupons explicitly.
CREATE UNIQUE INDEX "Coupon_platform_code_key" ON "Coupon"("code") WHERE "storeId" IS NULL;
