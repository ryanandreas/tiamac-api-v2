import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export class ServiceRequestService {
  static async updateSchedule(data: {
    serviceId: string;
    teknisiId: string;
    jadwalTanggal: string;
    changedByUserId?: string;
  }) {
    const { serviceId, teknisiId, jadwalTanggal, changedByUserId } = data;

    const current = await db.services.findUnique({
      where: { id: serviceId },
      select: { keluhan: true, status_servis: true },
    });

    const keluhanNext = this.upsertJadwalLine(current?.keluhan ?? "", jadwalTanggal);

    await db.$transaction(async (tx) => {
      await tx.services.update({
        where: { id: serviceId },
        data: {
          teknisiId,
          status: "Konfirmasi Teknisi",
          status_servis: "Konfirmasi Teknisi",
          keluhan: keluhanNext,
        },
      });

      if (current?.status_servis !== "Konfirmasi Teknisi") {
        await tx.serviceStatusHistory.create({
          data: {
            serviceId,
            status: "Konfirmasi Teknisi",
            status_servis: "Konfirmasi Teknisi",
            changedByUserId: changedByUserId || null,
            notes: `Penjadwalan teknisi ke tanggal ${jadwalTanggal}`,
          },
        });
      }
    });

    this.revalidatePaths();
  }

  static async updateService(data: {
    serviceId: string;
    status_servis?: string;
    teknisiId?: string;
    jadwal_tanggal?: string;
    jenis_servis?: string;
    changedByUserId?: string;
  }) {
    const { serviceId, status_servis, teknisiId, jadwal_tanggal, jenis_servis, changedByUserId } = data;

    const current = await db.services.findUnique({
      where: { id: serviceId },
      select: { status_servis: true, status: true, keluhan: true },
    });

    if (!current) throw new Error("Pesanan tidak ditemukan");

    const updateData: any = {};
    if (status_servis) {
      updateData.status = status_servis;
      updateData.status_servis = status_servis;
    }
    if (teknisiId !== undefined) updateData.teknisiId = teknisiId;
    if (jenis_servis !== undefined) updateData.jenis_servis = jenis_servis;
    if (jadwal_tanggal) {
      updateData.keluhan = this.upsertJadwalLine(current.keluhan ?? "", jadwal_tanggal);
    }

    await db.$transaction(async (tx) => {
      await tx.services.update({
        where: { id: serviceId },
        data: updateData,
      });

      if (status_servis && status_servis !== current.status_servis) {
        await tx.serviceStatusHistory.create({
          data: {
            serviceId,
            status: status_servis,
            status_servis: status_servis,
            changedByUserId: changedByUserId || null,
            notes: "Update data pesanan oleh admin",
          },
        });
      }
    });

    this.revalidatePaths();
  }

  private static upsertJadwalLine(keluhan: string, jadwalTanggal: string) {
    const lines = keluhan.split("\n");
    const idx = lines.findIndex((line) => /^Jadwal:/i.test(line.trim()));
    const nextLine = `Jadwal: ${jadwalTanggal}`;
    if (idx >= 0) {
      lines[idx] = nextLine;
      return lines.join("\n");
    }
    return [keluhan.trimEnd(), nextLine].filter(Boolean).join("\n");
  }

  static async deleteService(id: string) {
    await db.services.delete({
      where: { id },
    });
    this.revalidatePaths();
  }

  static async updateStatus(serviceId: string, status: string, status_servis?: string, changedByUserId?: string) {
    const current = await db.services.findUnique({
      where: { id: serviceId },
      select: { status_servis: true },
    });

    const targetStatus = status_servis || status;

    await db.$transaction(async (tx) => {
      await tx.services.update({
        where: { id: serviceId },
        data: {
          status,
          status_servis: targetStatus,
        },
      });

      if (current?.status_servis !== targetStatus) {
        await tx.serviceStatusHistory.create({
          data: {
            serviceId,
            status: status,
            status_servis: targetStatus,
            changedByUserId: changedByUserId || null,
          },
        });
      }
    });

    this.revalidatePaths();
  }

  static async logStatusHistory(data: {
    serviceId: string;
    status: string;
    status_servis: string;
    notes?: string;
    changedByUserId?: string;
  }) {
    return db.serviceStatusHistory.create({
      data: {
        serviceId: data.serviceId,
        status: data.status,
        status_servis: data.status_servis,
        notes: data.notes,
        changedByUserId: data.changedByUserId,
      },
    });
  }

  private static revalidatePaths() {
    revalidatePath("/dashboard/booking");
    revalidatePath("/dashboard/jadwal");
    revalidatePath("/dashboard/servis");
    revalidatePath("/dashboard/tugas");
    revalidatePath("/dashboard/servis/dalam-pengecekan");
    revalidatePath("/dashboard/servis/perbaikan-unit");
  }
}
