-- CreateTable
CREATE TABLE "service_ac_units" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "pk" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_ac_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_ac_unit_layanans" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "catalogId" TEXT,
    "nama" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_ac_unit_layanans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_ac_units_serviceId_idx" ON "service_ac_units"("serviceId");

-- CreateIndex
CREATE INDEX "service_ac_unit_layanans_unitId_idx" ON "service_ac_unit_layanans"("unitId");

-- CreateIndex
CREATE INDEX "service_ac_unit_layanans_catalogId_idx" ON "service_ac_unit_layanans"("catalogId");

-- AddForeignKey
ALTER TABLE "service_ac_units" ADD CONSTRAINT "service_ac_units_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_ac_unit_layanans" ADD CONSTRAINT "service_ac_unit_layanans_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "service_ac_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_ac_unit_layanans" ADD CONSTRAINT "service_ac_unit_layanans_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "ac_service_catalog"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
