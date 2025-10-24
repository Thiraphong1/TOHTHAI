-- AlterEnum
ALTER TYPE "public"."OrderStatus" ADD VALUE 'PENDING_CONFIRMATION';

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "paymentSlipUrl" TEXT;
