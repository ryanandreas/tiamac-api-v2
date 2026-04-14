import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export class TechnicianService {
  static async startPengecekan(serviceId: string, technicianId: string) {
    const service = await db.services.findUnique({
      where: { id: serviceId },
      select: { id: true, teknisiId: true, status_servis: true },
    });

    if (!service || service.teknisiId !== technicianId || service.status_servis !== "Konfirmasi Teknisi") {
      throw new Error("Servis tidak dapat diproses.");
    }

    await db.$transaction(async (tx) => {
      await tx.services.update({
        where: { id: serviceId },
        data: { status: "Pengecekan Unit", status_servis: "Pengecekan Unit" },
      });

      await tx.serviceStatusHistory.create({
        data: {
          serviceId,
          status: "Pengecekan Unit",
          status_servis: "Pengecekan Unit",
          changedByUserId: technicianId,
          notes: "Teknisi memulai pengecekan di lokasi",
        },
      });
    }, { timeout: 15000 });

    this.revalidateServicePaths(serviceId);
  }

  static async addMaterialUsage(data: {
    serviceId: string;
    itemId: string;
    qty: number;
    notes?: string;
    technicianId: string;
  }) {
    const { serviceId, itemId, qty, notes, technicianId } = data;

    const service = await db.services.findUnique({
      where: { id: serviceId },
      select: { id: true, teknisiId: true, status_servis: true },
    });
    
    if (!service || service.teknisiId !== technicianId || !this.isEditableStatus(service.status_servis)) {
      throw new Error("Servis tidak dapat diproses.");
    }

    const item = await db.inventoryItem.findUnique({
      where: { id: itemId },
      select: { id: true, harga: true, qtyOnHand: true },
    });
    
    if (!item) throw new Error("Barang tidak ditemukan.");
    if (item.qtyOnHand < qty) throw new Error("Stok tidak mencukupi.");

    await db.$transaction(async (tx) => {
      await tx.serviceMaterialUsage.create({
        data: {
          serviceId,
          itemId,
          qty,
          harga_satuan: item.harga,
          notes: notes?.trim() || null,
          createdByUserId: technicianId,
        },
      });

      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { qtyOnHand: { decrement: qty } },
      });

      await tx.stockMovement.create({
        data: {
          itemId,
          type: "OUT",
          qty,
          referenceType: "SERVICE_USAGE",
          referenceId: serviceId,
          notes: notes?.trim() || null,
          createdByUserId: technicianId,
        },
      });
    }, { timeout: 15000 });

    revalidatePath(`/dashboard/pengecekan/${serviceId}`);
  }

  static async submitPengecekan(data: {
    serviceId: string;
    diagnosa?: string;
    jasaTambahan: number;
    technicianId: string;
  }) {
    const { serviceId, diagnosa = "-", jasaTambahan, technicianId } = data;

    const service = await db.services.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        teknisiId: true,
        status_servis: true,
        keluhan: true,
        biaya_dasar: true,
        acUnits: { select: { pk: true, layanan: { select: { nama: true, harga: true } } } },
        materialUsages: { select: { qty: true, harga_satuan: true } },
      },
    });

    if (!service || service.teknisiId !== technicianId || !this.isEditableStatus(service.status_servis)) {
      throw new Error("Servis tidak dapat diproses.");
    }

    const materialTotal = service.materialUsages.reduce((sum, u) => sum + u.qty * u.harga_satuan, 0);
    const layananTotal = service.acUnits.reduce(
      (sum, unit) => sum + unit.layanan.reduce((inner, l) => inner + l.harga, 0),
      0
    );
    const baseTotal = (service.biaya_dasar ?? 50000) + layananTotal;
    const totalEstimasi = baseTotal + jasaTambahan + materialTotal;

    const layananUpdateLine = service.acUnits
      .map((unit, idx) => {
        const layananText =
          unit.layanan.length === 0
            ? "-"
            : unit.layanan
                .map((l) => `${l.nama} (Rp ${l.harga.toLocaleString("id-ID")})`)
                .join(", ");
        return `AC ${idx + 1}: PK ${unit.pk} | Layanan: ${layananText}`;
      })
      .join(" | ");

    let keluhanNext = service.keluhan ?? "";
    keluhanNext = this.upsertLine(keluhanNext, "Diagnosa: ", diagnosa.trim() || "-");
    keluhanNext = this.upsertLine(keluhanNext, "Layanan Update: ", layananUpdateLine || "-");
    keluhanNext = this.upsertLine(keluhanNext, "Jasa Tambahan: Rp ", jasaTambahan.toLocaleString("id-ID"));
    keluhanNext = this.upsertLine(keluhanNext, "Sparepart/Material: Rp ", materialTotal.toLocaleString("id-ID"));
    keluhanNext = this.upsertLine(keluhanNext, "Total Estimasi (Update): Rp ", totalEstimasi.toLocaleString("id-ID"));

    const isAlreadyWaiting = service.status_servis === "Menunggu Persetujuan Customer";

    await db.$transaction(async (tx) => {
      const updateData: any = {
        keluhan: keluhanNext,
        estimasi_biaya: totalEstimasi,
      };

      if (!isAlreadyWaiting) {
        updateData.status = "Menunggu Persetujuan Customer";
        updateData.status_servis = "Menunggu Persetujuan Customer";
        updateData.biaya_disetujui = false;
      }

      await tx.services.update({
        where: { id: serviceId },
        data: updateData,
      });

      if (!isAlreadyWaiting) {
        await tx.serviceStatusHistory.create({
          data: {
            serviceId,
            status: "Menunggu Persetujuan Customer",
            status_servis: "Menunggu Persetujuan Customer",
            changedByUserId: technicianId,
            notes: `Teknisi menyerahkan diagnosa dan estimasi biaya Rp ${totalEstimasi.toLocaleString("id-ID")}`,
          },
        });
      }
    }, { timeout: 15000 });

    this.revalidateServicePaths(serviceId);
  }

  static async uploadBukti(data: {
    serviceId: string;
    before: File;
    after: File;
    technicianId: string;
  }) {
    const { serviceId, before, after, technicianId } = data;

    const service = await db.services.findUnique({
      where: { id: serviceId },
      select: { id: true, teknisiId: true, status_servis: true },
    });
    
    if (!service || service.teknisiId !== technicianId || service.status_servis !== "Perbaikan Unit") {
      throw new Error("Servis tidak dapat diproses.");
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const saveFile = async (file: File) => {
      const ext = path.extname(file.name || "").toLowerCase() || ".jpg";
      const filename = `${randomUUID()}${ext}`;
      const abs = path.join(uploadDir, filename);
      const buf = Buffer.from(await file.arrayBuffer());
      await writeFile(abs, buf);
      return `/uploads/${filename}`;
    };

    const beforeUrl = await saveFile(before);
    const afterUrl = await saveFile(after);

    // Check if full payment is already settled
    const fullPayment = await db.servicePayment.findFirst({
      where: {
        serviceId,
        type: "FULL_PAYMENT",
        status: "SETTLEMENT",
      },
    });

    const nextStatus = fullPayment ? "Selesai (Garansi Aktif)" : "Menunggu Pembayaran";
    const historyNote = fullPayment 
      ? "Teknisi menyelesaikan pekerjaan. Pelunasan sudah lunas, status menjadi Selesai."
      : "Teknisi menyelesaikan pekerjaan dan mengupload bukti foto. Menunggu pelunasan.";

    await db.$transaction(async (tx) => {
      await tx.services.update({
        where: { id: serviceId },
        data: {
          bukti_foto_before: beforeUrl,
          bukti_foto_after: afterUrl,
          status: nextStatus,
          status_servis: nextStatus,
        },
      });

      await tx.serviceStatusHistory.create({
        data: {
          serviceId,
          status: nextStatus,
          status_servis: nextStatus,
          changedByUserId: technicianId,
          notes: historyNote,
        },
      });
    }, { timeout: 15000 });

    this.revalidateServicePaths(serviceId);
  }

  static async addUnitLayanan(data: { unitId: string; catalogId: string; technicianId: string }) {
    const { unitId, catalogId, technicianId } = data;
    const unit = await db.serviceAcUnit.findUnique({
      where: { id: unitId },
      include: {
        service: { select: { id: true, teknisiId: true, status_servis: true } },
        layanan: { select: { catalogId: true } },
      },
    });

    if (!unit || unit.service.teknisiId !== technicianId || !this.isEditableStatus(unit.service.status_servis)) {
      throw new Error("Servis tidak dapat diproses.");
    }

    if (unit.layanan.some((l) => l.catalogId === catalogId)) {
      throw new Error("Layanan sudah ada di unit ini.");
    }

    const catalog = await db.acServiceCatalog.findUnique({
      where: { uuid: catalogId },
    });
    if (!catalog) throw new Error("Katalog layanan tidak ditemukan.");

    await db.serviceAcUnitLayanan.create({
      data: {
        unitId,
        catalogId: catalog.uuid,
        nama: catalog.nama,
        harga: catalog.harga,
      },
    });

    revalidatePath(`/dashboard/pengecekan/${unit.service.id}`);
  }

  static async addAcUnit(data: { serviceId: string; pk: string; technicianId: string }) {
    const { serviceId, pk, technicianId } = data;
    const service = await db.services.findUnique({
      where: { id: serviceId },
      select: { id: true, teknisiId: true, status_servis: true },
    });

    if (!service || service.teknisiId !== technicianId || !this.isEditableStatus(service.status_servis)) {
      throw new Error("Servis tidak dapat diproses.");
    }

    await db.serviceAcUnit.create({
      data: {
        serviceId,
        pk,
      },
    });

    revalidatePath(`/dashboard/pengecekan/${serviceId}`);
  }

  static async removeAcUnit(data: { unitId: string; technicianId: string }) {
    const { unitId, technicianId } = data;
    const unit = await db.serviceAcUnit.findUnique({
      where: { id: unitId },
      include: {
        service: { select: { id: true, teknisiId: true, status_servis: true } },
      },
    });

    if (!unit || unit.service.teknisiId !== technicianId || !this.isEditableStatus(unit.service.status_servis)) {
      throw new Error("Data tidak dapat diproses.");
    }

    await db.serviceAcUnit.delete({ where: { id: unitId } });
    revalidatePath(`/dashboard/pengecekan/${unit.service.id}`);
  }

  static async removeUnitLayanan(data: { unitLayananId: string; technicianId: string }) {
    const { unitLayananId, technicianId } = data;
    const layanan = await db.serviceAcUnitLayanan.findUnique({
      where: { id: unitLayananId },
      include: {
        unit: { include: { service: { select: { id: true, teknisiId: true, status_servis: true } } } },
      },
    });

    if (!layanan || layanan.unit.service.teknisiId !== technicianId || !this.isEditableStatus(layanan.unit.service.status_servis)) {
      throw new Error("Data tidak dapat diproses.");
    }

    await db.serviceAcUnitLayanan.delete({ where: { id: unitLayananId } });
    revalidatePath(`/dashboard/pengecekan/${layanan.unit.service.id}`);
  }

  static async removeMaterialUsage(data: { usageId: string; technicianId: string }) {
    const { usageId, technicianId } = data;
    const usage = await db.serviceMaterialUsage.findUnique({
      where: { id: usageId },
      include: { service: { select: { id: true, teknisiId: true, status_servis: true } } },
    });

    if (!usage || usage.service.teknisiId !== technicianId || !this.isEditableStatus(usage.service.status_servis)) {
      throw new Error("Data tidak dapat diproses.");
    }

    await db.$transaction(async (tx) => {
      await tx.serviceMaterialUsage.delete({ where: { id: usageId } });
      await tx.inventoryItem.update({
        where: { id: usage.itemId },
        data: { qtyOnHand: { increment: usage.qty } },
      });
      await tx.stockMovement.create({
        data: {
          itemId: usage.itemId,
          type: "IN",
          qty: usage.qty,
          referenceType: "SERVICE_USAGE",
          referenceId: usage.serviceId,
          notes: "Revert pemakaian barang",
          createdByUserId: technicianId,
        },
      });
    }, { timeout: 15000 });

    revalidatePath(`/dashboard/pengecekan/${usage.serviceId}`);
  }

  private static isEditableStatus(status: string | null | undefined) {
    return status === "Konfirmasi Teknisi" || status === "Pengecekan Unit" || status === "Dalam Pengecekan" || status === "Menunggu Persetujuan Customer";
  }

  private static upsertLine(text: string, prefix: string, value: string) {
    const lines = text.split("\n");
    const idx = lines.findIndex((line) => line.trim().toLowerCase().startsWith(prefix.toLowerCase()));
    const nextLine = `${prefix}${value}`;
    if (idx >= 0) {
      lines[idx] = nextLine;
      return lines.join("\n");
    }
    return [text.trimEnd(), nextLine].filter(Boolean).join("\n");
  }

  private static revalidateServicePaths(serviceId: string) {
    revalidatePath("/dashboard/tugas");
    revalidatePath("/dashboard/pengecekan");
    revalidatePath(`/dashboard/pengecekan/${serviceId}`);
    revalidatePath("/dashboard/riwayat");
    revalidatePath("/dashboard/transaksi");
    revalidatePath("/dashboard/pengerjaan");
  }
}

