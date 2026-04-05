"use server"

import { getCurrentUser } from "@/app/actions/session"
import { ServiceRequestService } from "@/lib/services/service-request-service"
import { TechnicianService } from "@/lib/services/technician-service"
import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { InventoryUom } from "@prisma/client"

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

export async function updateServiceCatalog(id: string, data: {
  nama: string
  pk?: string
  harga: number
}): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    const updatedItem = await db.acServiceCatalog.update({
      where: { uuid: id },
      data: {
        nama: data.nama,
        pk: data.pk,
        harga: data.harga
      }
    })

    revalidatePath("/dashboard/layanan")
    return { success: true, message: "Layanan berhasil diperbarui", data: updatedItem }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memperbarui layanan" }
  }
}

export async function deleteServiceCatalog(id: string): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    await db.acServiceCatalog.delete({
      where: { uuid: id }
    })

    revalidatePath("/dashboard/layanan")
    return { success: true, message: "Layanan berhasil dihapus" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal menghapus layanan" }
  }
}

export async function createInventoryItem(data: {
  sku: string
  nama: string
  uom: InventoryUom
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

export async function updateInventoryItem(id: string, data: {
  sku: string
  nama: string
  uom: InventoryUom
  harga: number
  qtyOnHand: number
  minStock?: number
}): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    const updatedItem = await db.inventoryItem.update({
      where: { id },
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
    return { success: true, message: "Barang berhasil diperbarui", data: updatedItem }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memperbarui barang" }
  }
}

export async function deleteInventoryItem(id: string): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    await db.inventoryItem.delete({
      where: { id }
    })

    revalidatePath("/dashboard/inventory")
    return { success: true, message: "Barang berhasil dihapus" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal menghapus barang" }
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
            in: ["teknisi", "Staff", "Teknisi"],
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

export async function createStaffUser(data: {
  name: string
  email: string
  password?: string
  role: string
  no_telp?: string
  wilayah?: string
  bio?: string
}): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    const newUser = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password || "Tiamac123", // Default password if not provided
        staffProfile: {
          create: {
            role: data.role,
            no_telp: data.no_telp,
            wilayah: data.wilayah,
            bio: data.bio
          }
        }
      }
    })

    revalidatePath("/dashboard/users")
    return { success: true, message: "Staff berhasil ditambahkan", data: newUser }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal menambahkan staff" }
  }
}

export async function updateStaffUser(id: string, data: {
  name: string
  email: string
  status: any
  role: string
  no_telp?: string
  wilayah?: string
  bio?: string
}): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    await db.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        status: data.status,
        staffProfile: {
          update: {
            role: data.role,
            no_telp: data.no_telp,
            wilayah: data.wilayah,
            bio: data.bio
          }
        }
      }
    })

    revalidatePath("/dashboard/users")
    return { success: true, message: "Profil staff berhasil diperbarui" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memperbarui staff" }
  }
}

export async function deleteStaffUser(id: string): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff" || current.role?.toLowerCase() !== "admin") {
      return { success: false, message: "Unauthorized: Admin only" }
    }

    // Checking if trying to delete self
    if (current.id === id) {
      return { success: false, message: "Gagal: Anda tidak dapat menghapus akun Anda sendiri" }
    }

    await db.user.delete({
      where: { id }
    })

    revalidatePath("/dashboard/users")
    return { success: true, message: "Staff berhasil dihapus" }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal menghapus staff" }
  }
}

export async function getStaffActivity(userId: string): Promise<ActionResponse> {
  try {
    const current = await getCurrentUser()
    if (!current.isAuthenticated || current.type !== "staff") {
      return { success: false, message: "Unauthorized" }
    }

    // Fetching various activities
    const services = await db.services.findMany({
      where: { teknisiId: userId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, status_servis: true, updatedAt: true, jenis_servis: true }
    })

    const stockMovements = await db.stockMovement.findMany({
      where: { createdByUserId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { item: { select: { nama: true } } }
    })

    const materialUsages = await db.serviceMaterialUsage.findMany({
      where: { createdByUserId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { item: { select: { nama: true } } }
    })

    // Aggregating and sorting
    const rawActivities = [
      ...services.map(s => ({
        type: "SERVICE",
        title: `Mengerjakan: ${s.jenis_servis}`,
        subtitle: `Status: ${s.status_servis}`,
        date: s.updatedAt,
      })),
      ...stockMovements.map(m => ({
        type: "INVENTORY",
        title: `Gudang: ${m.type} ${m.qty} ${m.item.nama}`,
        subtitle: m.notes || "Mutasi stok",
        date: m.createdAt,
      })),
      ...materialUsages.map(u => ({
        type: "MATERIAL",
        title: `Penggunaan: ${u.qty} ${u.item.nama}`,
        subtitle: `Di service #${u.serviceId.slice(-6)}`,
        date: u.createdAt,
      }))
    ]

    const activities = rawActivities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 15)

    return { success: true, message: "Aktivitas berhasil dimuat", data: activities }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memuat aktivitas" }
  }
}
