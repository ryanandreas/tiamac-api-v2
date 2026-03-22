"use server"

import { ServiceRequestService } from "@/lib/services/service-request-service"
import { getCurrentUser } from "@/app/actions/session"

export type ActionResponse = { success: boolean; message: string } | null

export async function updateJadwal(
  serviceId: string,
  teknisiId: string,
  jadwalTanggal: string
): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== 'staff') {
       return { success: false, message: "Unauthorized" }
    }

    await ServiceRequestService.updateSchedule({
      serviceId,
      teknisiId,
      jadwalTanggal,
    })
    return { success: true, message: "Jadwal berhasil diperbarui" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memperbarui jadwal" }
  }
}


