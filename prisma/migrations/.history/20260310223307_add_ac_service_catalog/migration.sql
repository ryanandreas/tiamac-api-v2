-- CreateTable
CREATE TABLE "users" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "customers" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "no_telp" TEXT NOT NULL,
    "provinsi" TEXT,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "jenis_servis" TEXT NOT NULL,
    "keluhan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "status_servis" TEXT NOT NULL,
    "biaya" INTEGER,
    "teknisiId" TEXT,
    "biaya_dasar" INTEGER DEFAULT 50000,
    "estimasi_biaya" INTEGER,
    "biaya_disetujui" BOOLEAN NOT NULL DEFAULT false,
    "bukti_foto_before" TEXT,
    "bukti_foto_after" TEXT,
    "garansi_aktif_sampai" TIMESTAMP(3),
    "alasan_batal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ac_service_catalog" (
    "uuid" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "pk" TEXT,
    "harga" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ac_service_catalog_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ac_service_catalog_nama_pk_key" ON "ac_service_catalog"("nama", "pk");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_teknisiId_fkey" FOREIGN KEY ("teknisiId") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
