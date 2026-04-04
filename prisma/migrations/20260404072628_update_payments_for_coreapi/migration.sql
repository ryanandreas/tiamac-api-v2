/*
  Warnings:

  - You are about to drop the column `midtransSnapToken` on the `service_payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "service_payments" DROP COLUMN "midtransSnapToken",
ADD COLUMN     "bank" TEXT,
ADD COLUMN     "expiryTime" TIMESTAMP(3),
ADD COLUMN     "paymentDetails" JSONB,
ADD COLUMN     "qrUrl" TEXT,
ADD COLUMN     "vaNumber" TEXT;
