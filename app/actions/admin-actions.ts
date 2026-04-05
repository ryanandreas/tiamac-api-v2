"use server"

import { getCurrentUser } from "@/app/actions/session"
import { ServiceRequestService } from "@/lib/services/service-request-service"
import { TechnicianService } from "@/lib/services/technician-service"
import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"

export type ActionResponse = { success: boolean; message: string; data?: any } | null

export async function deleteService(id: string): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    await ServiceRequestService.deleteService(id)
    return { success: true, message: "Pesanan berhasil dihapus" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal menghapus pesanan" }
  }
}

export async function createServiceCatalog(data: {
  nama: string
  pk?: string
  harga: number
}): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    const newItem = await db.acServiceCatalog.create({
      data: {
        nama: data.nama,
        pk: data.pk,
        harga: data.harga
      }
    })

    revalidatePath("/dashboard/layanan")
    return { success: true, message: "Layanan berhasil ditambahkan", data: newItem }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal menambahkan layanan" }
  }
}

export async function createInventoryItem(data: {
  sku: string
  nama: string
  uom: any // InventoryUom
  harga: number
  qtyOnHand: number
  minStock?: number
}): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    const newItem = await db.inventoryItem.create({
      data: {
        sku: data.sku,
        nama: data.nama,
        uom: data.uom,
        harga: data.harga,
        qtyOnHand: data.qtyOnHand,
        minStock: data.minStock
      }
    })

    revalidatePath("/dashboard/inventory")
    return { success: true, message: "Barang berhasil ditambahkan", data: newItem }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal menambahkan barang" }
  }
}

export async function updateServiceAction(data: {
  serviceId: string
  status_servis?: string
  teknisiId?: string
  jadwal_tanggal?: string
}): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    await ServiceRequestService.updateService({
      ...data,
      changedByUserId: current.id,
    })

    return { success: true, message: "Pesanan berhasil diperbarui" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memperbarui pesanan" }
  }
}

export async function getTechniciansAction(): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff") {
      return { success: false, message: "Unauthorized" }
    }

    const teknisi = await db.user.findMany({
      where: {
        staffProfile: {
          role: {
            in: ["teknisi", "karyawan", "Staff", "Teknisi"],
            mode: "insensitive"
          }
        }
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: "asc"
      }
    })

    return { success: true, message: "Berhasil mengambil data teknisi", data: teknisi }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal mengambil data teknisi" }
  }
}

export async function adminAddAcUnit(input: { serviceId: string; pk: number }): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    await TechnicianService.addAcUnit({
      ...input,
      technicianId: current.id!,
    })
    revalidatePath(`/dashboard/servis/${input.serviceId}/edit`)
    return { success: true, message: "Unit AC berhasil ditambahkan" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function adminAddUnitLayanan(input: { unitId: string; catalogId: string; serviceId: string }): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    await TechnicianService.addUnitLayanan({
      unitId: input.unitId,
      catalogId: input.catalogId,
      technicianId: current.id!,
    })
    revalidatePath(`/dashboard/servis/${input.serviceId}/edit`)
    return { success: true, message: "Layanan berhasil ditambahkan" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function adminRemoveUnitLayanan(input: { unitLayananId: string; serviceId: string }): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    await TechnicianService.removeUnitLayanan({
      unitLayananId: input.unitLayananId,
      technicianId: current.id!,
    })
    revalidatePath(`/dashboard/servis/${input.serviceId}/edit`)
    return { success: true, message: "Layanan berhasil dihapus" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function adminAddMaterialUsage(input: {
  serviceId: string
  itemId: string
  qty: number
  notes?: string
}): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    await TechnicianService.addMaterialUsage({
      ...input,
      technicianId: current.id!,
    })
    revalidatePath(`/dashboard/servis/${input.serviceId}/edit`)
    return { success: true, message: "Material berhasil ditambahkan" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}

export async function adminRemoveMaterialUsage(input: { usageId: string; serviceId: string }): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    await TechnicianService.removeMaterialUsage({
      usageId: input.usageId,
      technicianId: current.id!,
    })
    revalidatePath(`/dashboard/servis/${input.serviceId}/edit`)
    return { success: true, message: "Material berhasil dihapus" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memproses" }
  }
}
