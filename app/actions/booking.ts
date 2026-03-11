'use server'

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"

export type CreateBookingState = { message: string } | null

type BookingUnit = { pk: number; layanan: string[] }

const BASE_VISIT_FEE = 50000

type CatalogIndex = Record<string, { defaultPrice?: number; priceByPk: Record<string, number> }>

function buildCatalogIndex(rows: Array<{ nama: string; pk: string | null; harga: number }>) {
  const idx: CatalogIndex = {}
  for (const row of rows) {
    if (!idx[row.nama]) idx[row.nama] = { priceByPk: {} }
    if (row.pk) idx[row.nama].priceByPk[row.pk] = row.harga
    else idx[row.nama].defaultPrice = row.harga
  }
  return idx
}

function getCatalogPrice(catalog: CatalogIndex, layananName: string, pk: number) {
  const item = catalog[layananName]
  if (!item) return undefined
  const pkKey = String(pk)
  return item.priceByPk[pkKey] ?? item.defaultPrice
}

export async function createAcBooking(
  _prevState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const current = await getCurrentUser()
  if (!current.isAuthenticated || current.type !== "customer") {
    redirect("/login")
  }

  const keluhan = (formData.get("keluhan") as string | null)?.trim()
  const alamat = (formData.get("alamat") as string | null)?.trim()
  const jadwalTanggal = (formData.get("jadwal_tanggal") as string | null)?.trim()
  const jadwalJam = (formData.get("jadwal_jam") as string | null)?.trim()
  const agree = formData.get("agree_biaya_kunjungan") === "on"
  const unitsJson = (formData.get("units_json") as string | null)?.trim()

  if (!keluhan) return { message: "Keluhan wajib diisi." }
  if (!alamat) return { message: "Alamat wajib diisi." }
  if (!jadwalTanggal || !jadwalJam) return { message: "Pilih jadwal kedatangan (tanggal & jam)." }
  if (!agree) return { message: "Anda harus menyetujui biaya kunjungan & diagnosa." }
  if (!unitsJson) return { message: "Pilih minimal 1 AC dan PK terlebih dahulu." }

  let units: BookingUnit[] = []
  try {
    const parsed: unknown = JSON.parse(unitsJson)
    if (!Array.isArray(parsed)) return { message: "Data AC tidak valid." }
    units = parsed
      .map((u) => {
        const obj = (u ?? {}) as Record<string, unknown>
        const pk = Number(obj.pk)
        const layanan = Array.isArray(obj.layanan) ? obj.layanan.map(String) : []
        return { pk, layanan }
      })
      .filter((u) => Number.isFinite(u.pk) && u.pk > 0)
  } catch {
    return { message: "Data AC tidak valid." }
  }

  if (units.length === 0) return { message: "Pilih PK untuk minimal 1 AC." }

  const layananNames = Array.from(new Set(units.flatMap((u) => u.layanan)))
  if (layananNames.length === 0) return { message: "Pilih minimal 1 layanan servis." }

  let catalogRows: Array<{ nama: string; pk: string | null; harga: number }> = []
  try {
    catalogRows = await db.acServiceCatalog.findMany({
      where: { nama: { in: layananNames } },
      select: { nama: true, pk: true, harga: true },
    })
  } catch {
    return { message: "Katalog layanan belum tersedia. Silakan hubungi admin." }
  }
  const catalog = buildCatalogIndex(catalogRows)
  for (const unit of units) {
    for (const name of unit.layanan) {
      const price = getCatalogPrice(catalog, name, unit.pk)
      if (price === undefined) {
        return { message: `Harga layanan "${name}" untuk PK ${unit.pk} belum tersedia.` }
      }
    }
  }

  const jadwalText = `${jadwalTanggal} ${jadwalJam}`

  const layananLines = units.map((unit, idx) => {
    const layananText =
      unit.layanan.length === 0
        ? "-"
        : unit.layanan
            .map((name) => {
              const price = getCatalogPrice(catalog, name, unit.pk) as number
              return `${name} (Rp ${price.toLocaleString("id-ID")})`
            })
            .join(", ")
    return `AC ${idx + 1}: PK ${unit.pk} | Layanan: ${layananText}`
  })

  const layananTotal = units.reduce((sum, unit) => {
    return (
      sum +
      unit.layanan.reduce((inner, name) => {
        const price = getCatalogPrice(catalog, name, unit.pk)
        if (price === undefined) return inner
        return inner + price
      }, 0)
    )
  }, 0)
  const estimasiTotal = BASE_VISIT_FEE + layananTotal

  const keluhanGabungan = [
    keluhan,
    "",
    ...layananLines,
    `Total Estimasi: Rp ${estimasiTotal.toLocaleString("id-ID")}`,
    "",
    `Alamat: ${alamat}`,
    `Jadwal: ${jadwalText}`,
    "",
    "Catatan: Biaya kunjungan & diagnosa Rp 50.000 tetap dibayar jika perbaikan tidak dilanjutkan.",
  ].join("\n")

  try {
    await db.services.create({
      data: {
        customerId: current.id,
        jenis_servis: "AC",
        keluhan: keluhanGabungan,
        status: "Booking",
        status_servis: "Booking",
        biaya_dasar: BASE_VISIT_FEE,
        estimasi_biaya: estimasiTotal,
      },
    })
  } catch {
    return { message: "Booking gagal dibuat. Silakan coba lagi." }
  }

  redirect("/listpesanan?tab=history")
}
