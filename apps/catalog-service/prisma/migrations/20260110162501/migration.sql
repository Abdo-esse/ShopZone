/*
  Warnings:

  - You are about to drop the column `isActive` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'PENDING_DELETE');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isActive",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT';
