import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export class ServiceRequestService {
  static async updateSchedule(data: {
    serviceId: string;
    teknisiId: string;
    jadwalTanggal: string;
  }) {
    const { serviceId, teknisiId, jadwalTanggal } = data;

    const current = await db.services.findUnique({
      where: { id: serviceId },
      select: { keluhan: true },
    });

    const keluhanNext = this.upsertJadwalLine(current?.keluhan ?? "", jadwalTanggal);

    await db.services.update({
      where: { id: serviceId },
      data: {
        teknisiId,
        status: "Teknisi Dikonfirmasi",
        status_servis: "Teknisi Dikonfirmasi",
        keluhan: keluhanNext,
      },
    });

    revalidatePath("/dashboard/jadwal");
    revalidatePath("/dashboard/servis");
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

  static async updateStatus(serviceId: string, status: string, status_servis?: string) {
    return db.services.update({
      where: { id: serviceId },
      data: {
        status,
        status_servis: status_servis || status,
      },
    });
  }
}
