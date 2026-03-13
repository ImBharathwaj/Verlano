/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.

*/
-- Add new categories array column
ALTER TABLE "Product" ADD COLUMN "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill: move existing single category into array
UPDATE "Product" SET "categories" = ARRAY[category] WHERE category IS NOT NULL;
UPDATE "Product" SET "categories" = '{}' WHERE category IS NULL;

-- Drop old column
ALTER TABLE "Product" DROP COLUMN "category";
