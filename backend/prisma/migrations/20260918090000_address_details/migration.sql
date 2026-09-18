-- AlterTable: extend addresses with structured delivery details.
-- All new columns are optional so existing rows keep working.
ALTER TABLE "Address"
  ADD COLUMN "governorate" TEXT,
  ADD COLUMN "area" TEXT,
  ADD COLUMN "street" TEXT,
  ADD COLUMN "building" TEXT,
  ADD COLUMN "floor" TEXT,
  ADD COLUMN "additionalInfo" TEXT,
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION;
