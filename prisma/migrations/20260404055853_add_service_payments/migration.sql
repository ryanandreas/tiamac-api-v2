-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DOWN_PAYMENT', 'FULL_PAYMENT');

-- CreateTable
CREATE TABLE "service_payments" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "midtransSnapToken" TEXT,
    "midtransTransactionId" TEXT,
    "metodePembayaran" TEXT,
    "waktuPembayaran" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_payments_serviceId_idx" ON "service_payments"("serviceId");

-- AddForeignKey
ALTER TABLE "service_payments" ADD CONSTRAINT "service_payments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
