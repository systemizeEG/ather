-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPackage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "compareAtPrice" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL DEFAULT 'ORDERS',
    "targetValue" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "ProductPackage_productId_idx" ON "ProductPackage"("productId");

-- CreateIndex
CREATE INDEX "ProductPackage_productId_isActive_idx" ON "ProductPackage"("productId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_userId_key" ON "CandidateProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_couponId_key" ON "CandidateProfile"("couponId");

-- CreateIndex
CREATE INDEX "CandidateProfile_couponId_idx" ON "CandidateProfile"("couponId");

-- CreateIndex
CREATE INDEX "CandidateProfile_isActive_idx" ON "CandidateProfile"("isActive");

-- AlterTable Product: add categoryId while keeping legacy category text for backfill
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- Seed Uncategorized and migrate existing product.category strings
INSERT INTO "Category" ("id", "name", "slug", "description", "isActive", "createdAt", "updatedAt")
VALUES (
  'cluncategorized0001',
  'بدون قسم',
  'uncategorized',
  'منتجات لم يتم تصنيفها بعد',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

DO $$
DECLARE
  r RECORD;
  cat_id TEXT;
  cat_slug TEXT;
  base_slug TEXT;
  suffix INT;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Product'
      AND column_name = 'category'
  ) THEN
    FOR r IN
      SELECT DISTINCT trim(category) AS name
      FROM "Product"
      WHERE category IS NOT NULL AND trim(category) <> ''
    LOOP
      IF EXISTS (SELECT 1 FROM "Category" WHERE "name" = r.name) THEN
        CONTINUE;
      END IF;

      base_slug := trim(both '-' FROM lower(regexp_replace(r.name, '[^\w]+', '-', 'g')));
      IF base_slug IS NULL OR base_slug = '' THEN
        base_slug := 'cat-' || substr(md5(r.name), 1, 10);
      END IF;

      cat_slug := base_slug;
      suffix := 2;
      WHILE EXISTS (SELECT 1 FROM "Category" WHERE "slug" = cat_slug) LOOP
        cat_slug := base_slug || '-' || suffix;
        suffix := suffix + 1;
      END LOOP;

      cat_id := 'cat_' || substr(md5(r.name || clock_timestamp()::text), 1, 16);

      INSERT INTO "Category" ("id", "name", "slug", "isActive", "createdAt", "updatedAt")
      VALUES (cat_id, r.name, cat_slug, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    END LOOP;

    UPDATE "Product" p
    SET "categoryId" = c."id"
    FROM "Category" c
    WHERE p."categoryId" IS NULL
      AND p.category IS NOT NULL
      AND trim(p.category) = c."name";
  END IF;
END $$;

UPDATE "Product"
SET "categoryId" = (
  SELECT "id" FROM "Category" WHERE "slug" = 'uncategorized' LIMIT 1
)
WHERE "categoryId" IS NULL;

ALTER TABLE "Product" DROP COLUMN IF EXISTS "category";

CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductPackage"
  ADD CONSTRAINT "ProductPackage_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Order item package snapshots
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "packageId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "packageNameSnapshot" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "packageQuantitySnapshot" INTEGER;

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX IF NOT EXISTS "OrderItem_packageId_idx" ON "OrderItem"("packageId");

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_packageId_fkey"
  FOREIGN KEY ("packageId") REFERENCES "ProductPackage"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Order lookup indexes
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_discountCode_idx" ON "Order"("discountCode");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");

-- User roles (existing users remain customers)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'CUSTOMER';
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- Coupon type for candidate vs general codes
ALTER TABLE "DiscountCode" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'GENERAL';
CREATE INDEX IF NOT EXISTS "DiscountCode_type_idx" ON "DiscountCode"("type");
CREATE INDEX IF NOT EXISTS "DiscountCode_isActive_idx" ON "DiscountCode"("isActive");

ALTER TABLE "CandidateProfile"
  ADD CONSTRAINT "CandidateProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CandidateProfile"
  ADD CONSTRAINT "CandidateProfile_couponId_fkey"
  FOREIGN KEY ("couponId") REFERENCES "DiscountCode"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
