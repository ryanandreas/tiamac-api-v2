/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_customerId_fkey";

-- CreateTable
CREATE TABLE "customer_profiles" (
    "userId" TEXT NOT NULL,
    "no_telp" TEXT NOT NULL,
    "provinsi" TEXT,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "staff_profiles" (
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("userId")
);

-- AlterTable
ALTER TABLE "users"
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

INSERT INTO "staff_profiles" ("userId", "role", "createdAt", "updatedAt")
SELECT "uuid", "role", "createdAt", "updatedAt"
FROM "users"
WHERE "role" IS NOT NULL
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "users" ("uuid", "name", "email", "password", "role", "status", "lastLogin", "createdAt", "updatedAt")
SELECT c."uuid", c."name", c."email", c."password", 'customer', 'ACTIVE'::"UserStatus", NULL, c."createdAt", c."updatedAt"
FROM "customers" c
ON CONFLICT ("uuid") DO NOTHING;

INSERT INTO "customer_profiles" ("userId", "no_telp", "provinsi", "alamat", "createdAt", "updatedAt")
SELECT c."uuid", c."no_telp", c."provinsi", c."alamat", c."createdAt", c."updatedAt"
FROM "customers" c
ON CONFLICT ("userId") DO NOTHING;

ALTER TABLE "users" DROP COLUMN "role";

DROP TABLE "customers";

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
