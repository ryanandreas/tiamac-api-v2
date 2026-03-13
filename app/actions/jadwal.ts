"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

function upsertJadwalLine(keluhan: string, jadwalTanggal: string) {
  const lines = keluhan.split("\n")
  const idx = lines.findIndex((line) => /^Jadwal:/i.test(line.trim()))
  const nextLine = `Jadwal: ${jadwalTanggal}`
  if (idx >= 0) {
    lines[idx] = nextLine
    return lines.join("\n")
  }
  return [keluhan.trimEnd(), nextLine].filter(Boolean).join("\n")
}

export async function updateJadwal(
  serviceId: string,
  teknisiId: string,
  jadwalTanggal: string
) {
  try {
    const current = await db.services.findUnique({
      where: { id: serviceId },
      select: { keluhan: true },
    })

    const keluhanNext = upsertJadwalLine(current?.keluhan ?? "", jadwalTanggal)

    await db.services.update({
      where: { id: serviceId },
      data: {
        teknisiId,
        status: "Teknisi Dikonfirmasi",
        status_servis: "Teknisi Dikonfirmasi",
        keluhan: keluhanNext,
      },
    })
    revalidatePath("/dashboard/jadwal")
    revalidatePath("/dashboard/servis")
    return { success: true }
  } catch {
    return { success: false, message: "Gagal memperbarui jadwal." }
  }
}
