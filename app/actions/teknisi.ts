"use server"

import { getCurrentUser } from "@/app/actions/session"
import { TechnicianService } from "@/lib/services/technician-service"

export type ActionResponse = { success: boolean; message: string } | null

function ensureTechnician(current: any) {
  if (
    !current.isAuthenticated ||
    current.type !== "staff" ||
    (current.role?.toLowerCase() !== "teknisi" && current.role?.toLowerCase() !== "karyawan")
  ) {
    throw new Error("UNAUTHORIZED")
  }
}

export async function startPengecekan(serviceId: string): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    ensureTechnician(current)
    await TechnicianService.startPengecekan(serviceId, current.id!)
    return { success: true, message: "Berhasil memulai pengecekan" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function addMaterialUsage(input: {
  serviceId: string
  itemId: string
  qty: number
  notes?: string
}): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    ensureTechnician(current)
    await TechnicianService.addMaterialUsage({
      ...input,
      technicianId: current.id!,
    })
    return { success: true, message: "Material berhasil ditambahkan" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function addUnitLayanan(input: { unitId: string; catalogId: string }): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    ensureTechnician(current)
    await TechnicianService.addUnitLayanan({
      ...input,
      technicianId: current.id!,
    })
    return { success: true, message: "Layanan berhasil ditambahkan" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function addAcUnit(input: { serviceId: string; pk: number }): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    ensureTechnician(current)
    await TechnicianService.addAcUnit({
      ...input,
      technicianId: current.id!,
    })
    return { success: true, message: "Unit AC berhasil ditambahkan" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function removeUnitLayanan(input: { unitLayananId: string }): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    ensureTechnician(current)
    await TechnicianService.removeUnitLayanan({
      ...input,
      technicianId: current.id!,
    })
    return { success: true, message: "Layanan berhasil dihapus" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function removeMaterialUsage(input: { usageId: string }): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    ensureTechnician(current)
    await TechnicianService.removeMaterialUsage({
      ...input,
      technicianId: current.id!,
    })
    return { success: true, message: "Material berhasil dihapus" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function removeAcUnit(input: { unitId: string }): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    ensureTechnician(current)
    await TechnicianService.removeAcUnit({
      ...input,
      technicianId: current.id!,
    })
    return { success: true, message: "Unit AC berhasil dihapus" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function submitPengecekan(input: {
  serviceId: string
  diagnosa?: string
  jasaTambahan: number
}): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    ensureTechnician(current)
    await TechnicianService.submitPengecekan({
      ...input,
      technicianId: current.id!,
    })
    return { success: true, message: "Pengecekan berhasil dikirim" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function uploadBuktiServis(input: {
  serviceId: string
  before: File
  after: File
}): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    ensureTechnician(current)
    await TechnicianService.uploadBukti({
      ...input,
      technicianId: current.id!,
    })
    return { success: true, message: "Bukti servis berhasil diupload" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}


