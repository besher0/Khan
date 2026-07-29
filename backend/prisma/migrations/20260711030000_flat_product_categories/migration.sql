ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";
DROP INDEX "Category_type_idx";
ALTER TABLE "Category" DROP COLUMN "parentId";
ALTER TABLE "Category" DROP COLUMN "type";
DROP TYPE "CategoryType";
