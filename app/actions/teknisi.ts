"use server"

import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { revalidatePath } from "next/cache"

function ensureTechnician(current: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (
    !current.isAuthenticated ||
    current.type !== "staff" ||
    (current.role?.toLowerCase() !== "teknisi" && current.role?.toLowerCase() !== "karyawan")
  ) {
    throw new Error("UNAUTHORIZED")
  }
  return current
}

function isEditableTeknisiStatus(status: string | null | undefined) {
  return status === "Teknisi Dikonfirmasi" || status === "Dalam Pengecekan"
}

function upsertLine(text: string, prefix: string, value: string) {
  const lines = text.split("\n")
  const idx = lines.findIndex((line) => line.trim().toLowerCase().startsWith(prefix.toLowerCase()))
  const nextLine = `${prefix}${value}`
  if (idx >= 0) {
    lines[idx] = nextLine
    return lines.join("\n")
  }
  return [text.trimEnd(), nextLine].filter(Boolean).join("\n")
}

export async function startPengecekan(serviceId: string) {
  const current = ensureTechnician(await getCurrentUser())

  const service = await db.services.findUnique({
    where: { id: serviceId },
    select: { id: true, teknisiId: true, status_servis: true },
  })

  if (!service || service.teknisiId !== current.id || service.status_servis !== "Teknisi Dikonfirmasi") {
    return { success: false, message: "Servis tidak dapat diproses." }
  }

  await db.services.update({
    where: { id: serviceId },
    data: { status: "Dalam Pengecekan", status_servis: "Dalam Pengecekan" },
  })

  revalidatePath("/dashboard/tugas")
  revalidatePath("/dashboard/pengecekan")
  revalidatePath(`/dashboard/pengecekan/${serviceId}`)
  return { success: true }
}

export async function addMaterialUsage(input: {
  serviceId: string
  itemId: string
  qty: number
  notes?: string
}) {
  const current = ensureTechnician(await getCurrentUser())
  const qty = Math.floor(Number(input.qty))
  if (!Number.isFinite(qty) || qty <= 0) {
    return { success: false, message: "Qty tidak valid." }
  }

  const service = await db.services.findUnique({
    where: { id: input.serviceId },
    select: { id: true, teknisiId: true, status_servis: true },
  })
  if (!service || service.teknisiId !== current.id || !isEditableTeknisiStatus(service.status_servis)) {
    return { success: false, message: "Servis tidak dapat diproses." }
  }

  const item = await db.inventoryItem.findUnique({
    where: { id: input.itemId },
    select: { id: true, harga: true, qtyOnHand: true },
  })
  if (!item) return { success: false, message: "Barang tidak ditemukan." }
  if (item.qtyOnHand < qty) return { success: false, message: "Stok tidak mencukupi." }

  await db.$transaction(async (tx) => {
    await tx.serviceMaterialUsage.create({
      data: {
        serviceId: input.serviceId,
        itemId: input.itemId,
        qty,
        harga_satuan: item.harga,
        notes: input.notes?.trim() || null,
        createdByUserId: current.id,
      },
    })

    await tx.inventoryItem.update({
      where: { id: input.itemId },
      data: { qtyOnHand: { decrement: qty } },
    })

    await tx.stockMovement.create({
      data: {
        itemId: input.itemId,
        type: "OUT",
        qty,
        referenceType: "SERVICE_USAGE",
        referenceId: input.serviceId,
        notes: input.notes?.trim() || null,
        createdByUserId: current.id,
      },
    })
  })

  revalidatePath(`/dashboard/pengecekan/${input.serviceId}`)
  return { success: true }
}

export async function addUnitLayanan(input: { unitId: string; catalogId: string }) {
  const current = ensureTechnician(await getCurrentUser())

  const unit = await db.serviceAcUnit.findUnique({
    where: { id: input.unitId },
    include: {
      service: { select: { id: true, teknisiId: true, status_servis: true } },
      layanan: { select: { catalogId: true } },
    },
  })
  if (
    !unit ||
    unit.service.teknisiId !== current.id ||
    !isEditableTeknisiStatus(unit.service.status_servis)
  ) {
    return { success: false, message: "Servis tidak dapat diproses." }
  }

  const already = unit.layanan.some((l) => l.catalogId === input.catalogId)
  if (already) return { success: false, message: "Layanan sudah ada di unit ini." }

  const catalog = await db.acServiceCatalog.findUnique({
    where: { uuid: input.catalogId },
    select: { uuid: true, nama: true, harga: true },
  })
  if (!catalog) return { success: false, message: "Katalog layanan tidak ditemukan." }

  await db.serviceAcUnitLayanan.create({
    data: {
      unitId: unit.id,
      catalogId: catalog.uuid,
      nama: catalog.nama,
      harga: catalog.harga,
    },
  })

  revalidatePath(`/dashboard/pengecekan/${unit.service.id}`)
  return { success: true }
}

export async function removeUnitLayanan(input: { unitLayananId: string }) {
  const current = ensureTechnician(await getCurrentUser())

  const layanan = await db.serviceAcUnitLayanan.findUnique({
    where: { id: input.unitLayananId },
    include: {
      unit: {
        include: { service: { select: { id: true, teknisiId: true, status_servis: true } } },
      },
    },
  })
  if (
    !layanan ||
    layanan.unit.service.teknisiId !== current.id ||
    !isEditableTeknisiStatus(layanan.unit.service.status_servis)
  ) {
    return { success: false, message: "Data tidak dapat diproses." }
  }

  await db.serviceAcUnitLayanan.delete({ where: { id: input.unitLayananId } })
  revalidatePath(`/dashboard/pengecekan/${layanan.unit.service.id}`)
  return { success: true }
}

export async function removeMaterialUsage(input: { usageId: string }) {
  const current = ensureTechnician(await getCurrentUser())

  const usage = await db.serviceMaterialUsage.findUnique({
    where: { id: input.usageId },
    include: { service: { select: { id: true, teknisiId: true, status_servis: true } }, item: true },
  })

  if (!usage || usage.service.teknisiId !== current.id || !isEditableTeknisiStatus(usage.service.status_servis)) {
    return { success: false, message: "Data tidak dapat diproses." }
  }

  await db.$transaction(async (tx) => {
    await tx.serviceMaterialUsage.delete({ where: { id: input.usageId } })

    await tx.inventoryItem.update({
      where: { id: usage.itemId },
      data: { qtyOnHand: { increment: usage.qty } },
    })

    await tx.stockMovement.create({
      data: {
        itemId: usage.itemId,
        type: "IN",
        qty: usage.qty,
        referenceType: "SERVICE_USAGE",
        referenceId: usage.serviceId,
        notes: "Revert pemakaian barang",
        createdByUserId: current.id,
      },
    })
  })

  revalidatePath(`/dashboard/pengecekan/${usage.serviceId}`)
  return { success: true }
}

export async function submitPengecekan(input: {
  serviceId: string
  diagnosa: string
  jasaTambahan: number
}) {
  const current = ensureTechnician(await getCurrentUser())
  const jasaTambahan = Math.floor(Number(input.jasaTambahan))
  if (!Number.isFinite(jasaTambahan) || jasaTambahan < 0) {
    return { success: false, message: "Biaya jasa tidak valid." }
  }

  const service = await db.services.findUnique({
    where: { id: input.serviceId },
    select: {
      id: true,
      teknisiId: true,
      status_servis: true,
      keluhan: true,
      biaya_dasar: true,
      acUnits: { select: { pk: true, layanan: { select: { nama: true, harga: true } } } },
      materialUsages: { select: { qty: true, harga_satuan: true } },
    },
  })

  if (!service || service.teknisiId !== current.id || !isEditableTeknisiStatus(service.status_servis)) {
    return { success: false, message: "Servis tidak dapat diproses." }
  }

  const materialTotal = service.materialUsages.reduce((sum, u) => sum + u.qty * u.harga_satuan, 0)
  const layananTotal = service.acUnits.reduce(
    (sum, unit) => sum + unit.layanan.reduce((inner, l) => inner + l.harga, 0),
    0
  )
  const baseTotal = (service.biaya_dasar ?? 50000) + layananTotal
  const totalEstimasi = baseTotal + jasaTambahan + materialTotal

  const layananUpdateLine = service.acUnits
    .map((unit, idx) => {
      const layananText =
        unit.layanan.length === 0
          ? "-"
          : unit.layanan
              .map((l) => `${l.nama} (Rp ${l.harga.toLocaleString("id-ID")})`)
              .join(", ")
      return `AC ${idx + 1}: PK ${unit.pk} | Layanan: ${layananText}`
    })
    .join(" | ")

  let keluhanNext = service.keluhan ?? ""
  keluhanNext = upsertLine(keluhanNext, "Diagnosa: ", input.diagnosa.trim() || "-")
  keluhanNext = upsertLine(keluhanNext, "Layanan Update: ", layananUpdateLine || "-")
  keluhanNext = upsertLine(keluhanNext, "Jasa Tambahan: Rp ", jasaTambahan.toLocaleString("id-ID"))
  keluhanNext = upsertLine(
    keluhanNext,
    "Sparepart/Material: Rp ",
    materialTotal.toLocaleString("id-ID")
  )
  keluhanNext = upsertLine(
    keluhanNext,
    "Total Estimasi (Update): Rp ",
    totalEstimasi.toLocaleString("id-ID")
  )

  await db.services.update({
    where: { id: input.serviceId },
    data: {
      keluhan: keluhanNext,
      estimasi_biaya: totalEstimasi,
      status: "Menunggu Persetujuan Customer",
      status_servis: "Menunggu Persetujuan Customer",
      biaya_disetujui: false,
    },
  })

  revalidatePath("/dashboard/pengecekan")
  revalidatePath("/dashboard/tugas")
  revalidatePath("/dashboard/riwayat")
  return { success: true }
}

export async function uploadBuktiServis(input: {
  serviceId: string
  before: File
  after: File
}) {
  const current = ensureTechnician(await getCurrentUser())

  const service = await db.services.findUnique({
    where: { id: input.serviceId },
    select: { id: true, teknisiId: true, status_servis: true },
  })
  if (!service || service.teknisiId !== current.id || service.status_servis !== "Sedang Dikerjakan") {
    return { success: false, message: "Servis tidak dapat diproses." }
  }

  const files: Array<{ key: "before" | "after"; file: File }> = [
    { key: "before", file: input.before },
    { key: "after", file: input.after },
  ]

  for (const { file } of files) {
    if (!file || file.size === 0) return { success: false, message: "File wajib diupload." }
    if (!file.type.startsWith("image/")) return { success: false, message: "File harus berupa gambar." }
    if (file.size > 5 * 1024 * 1024) return { success: false, message: "Ukuran file maksimal 5MB." }
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads")
  await mkdir(uploadDir, { recursive: true })

  async function save(file: File) {
    const ext = path.extname(file.name || "").toLowerCase() || ".jpg"
    const filename = `${randomUUID()}${ext}`
    const abs = path.join(uploadDir, filename)
    const buf = Buffer.from(await file.arrayBuffer())
    await writeFile(abs, buf)
    return `/uploads/${filename}`
  }

  const beforeUrl = await save(input.before)
  const afterUrl = await save(input.after)

  await db.services.update({
    where: { id: input.serviceId },
    data: {
      bukti_foto_before: beforeUrl,
      bukti_foto_after: afterUrl,
      status: "Menunggu Pembayaran",
      status_servis: "Menunggu Pembayaran",
    },
  })

  revalidatePath("/dashboard/pengerjaan")
  revalidatePath("/dashboard/tugas")
  revalidatePath("/dashboard/riwayat")
  revalidatePath("/dashboard/transaksi")
  return { success: true }
}
