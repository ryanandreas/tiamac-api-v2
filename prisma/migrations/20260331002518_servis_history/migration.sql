-- CreateTable
CREATE TABLE "service_status_history" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "status_servis" TEXT NOT NULL,
    "notes" TEXT,
    "changedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_status_history_serviceId_idx" ON "service_status_history"("serviceId");

-- AddForeignKey
ALTER TABLE "service_status_history" ADD CONSTRAINT "service_status_history_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_status_history" ADD CONSTRAINT "service_status_history_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
