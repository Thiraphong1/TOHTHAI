-- CreateEnum
CREATE TYPE "public"."DeliveryMethod" AS ENUM ('DELIVERY', 'TABLE');

-- AlterTable
ALTER TABLE "public"."Cart" ADD COLUMN     "deliveryMethod" "public"."DeliveryMethod",
ADD COLUMN     "tableId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "deliveryMethod" "public"."DeliveryMethod";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "postalCode" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;
