/*
  Warnings:

  - The `orderStatus` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Table` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ProductonCart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductonOrder` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[orderedById]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN', 'EMPLOYEE', 'COOK');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('NOT_PROCESSED', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED');

-- DropForeignKey
ALTER TABLE "public"."ProductonCart" DROP CONSTRAINT "ProductonCart_cartId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductonCart" DROP CONSTRAINT "ProductonCart_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductonOrder" DROP CONSTRAINT "ProductonOrder_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductonOrder" DROP CONSTRAINT "ProductonOrder_productId_fkey";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "orderStatus",
ADD COLUMN     "orderStatus" "public"."OrderStatus" NOT NULL DEFAULT 'NOT_PROCESSED';

-- AlterTable
ALTER TABLE "public"."Table" DROP COLUMN "status",
ADD COLUMN     "status" "public"."TableStatus" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role",
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "public"."ProductonCart";

-- DropTable
DROP TABLE "public"."ProductonOrder";

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_orderedById_key" ON "public"."Cart"("orderedById");

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
