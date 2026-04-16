/*
  Warnings:

  - The values [botol] on the enum `InventoryUom` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InventoryUom_new" AS ENUM ('pcs', 'meter', 'set', 'btg', 'roll', 'kg', 'liter', 'tabung');
ALTER TABLE "inventory_items" ALTER COLUMN "uom" TYPE "InventoryUom_new" USING ("uom"::text::"InventoryUom_new");
ALTER TYPE "InventoryUom" RENAME TO "InventoryUom_old";
ALTER TYPE "InventoryUom_new" RENAME TO "InventoryUom";
DROP TYPE "InventoryUom_old";
COMMIT;

-- AlterTable
ALTER TABLE "service_ac_units" ALTER COLUMN "pk" SET DATA TYPE TEXT;
