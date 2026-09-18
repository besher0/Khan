-- SavedStore: customer "Tag" saves for stores (separate from product Favorite hearts)
CREATE TABLE "SavedStore" (
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedStore_pkey" PRIMARY KEY ("userId","storeId")
);

CREATE INDEX "SavedStore_storeId_idx" ON "SavedStore"("storeId");

ALTER TABLE "SavedStore" ADD CONSTRAINT "SavedStore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedStore" ADD CONSTRAINT "SavedStore_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
