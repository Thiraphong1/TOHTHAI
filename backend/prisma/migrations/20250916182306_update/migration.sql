-- DropForeignKey
ALTER TABLE "public"."ProductonCart" DROP CONSTRAINT "ProductonCart_productId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ProductonCart" ADD CONSTRAINT "ProductonCart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
