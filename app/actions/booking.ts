'use server'

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { cookies } from "next/headers"
import { randomUUID } from "crypto"

export type CreateBookingState = { message: string } | null

type BookingUnit = { pk: number; layanan: string[] }

const BASE_VISIT_FEE = 50000

type CatalogIndex = Record<
  string,
  { default?: { harga: number; uuid: string }; byPk: Record<string, { harga: number; uuid: string }> }
>

function buildCatalogIndex(rows: Array<{ uuid: string; nama: string; pk: string | null; harga: number }>) {
  const idx: CatalogIndex = {}
  for (const row of rows) {
    if (!idx[row.nama]) idx[row.nama] = { byPk: {} }
    if (row.pk) idx[row.nama].byPk[row.pk] = { harga: row.harga, uuid: row.uuid }
    else idx[row.nama].default = { harga: row.harga, uuid: row.uuid }
  }
  return idx
}

function getCatalogEntry(catalog: CatalogIndex, layananName: string, pk: number) {
  const item = catalog[layananName]
  if (!item) return undefined
  const pkKey = String(pk)
  return item.byPk[pkKey] ?? item.default
}

export async function createAcBooking(
  _prevState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const current = await getCurrentUser()
  if (current.isAuthenticated && current.type === "staff") {
    return { message: "Akun staff tidak dapat membuat booking." }
  }

  const keluhan = (formData.get("keluhan") as string | null)?.trim()
  const alamat = (formData.get("alamat") as string | null)?.trim()
  const jadwalTanggal = (formData.get("jadwal_tanggal") as string | null)?.trim()
  const agree = formData.get("agree_biaya_kunjungan") === "on"
  const unitsJson = (formData.get("units_json") as string | null)?.trim()
  const pemesanNama = (formData.get("pemesan_nama") as string | null)?.trim()
  const pemesanEmail = (formData.get("pemesan_email") as string | null)?.trim()
  const pemesanNoTelp = (formData.get("pemesan_no_telp") as string | null)?.trim()

  if (!keluhan) return { message: "Keluhan wajib diisi." }
  if (!alamat) return { message: "Alamat wajib diisi." }
  if (!jadwalTanggal) return { message: "Pilih hari kedatangan." }
  if (!agree) return { message: "Anda harus menyetujui biaya kunjungan & diagnosa." }
  if (!unitsJson) return { message: "Pilih minimal 1 AC dan PK terlebih dahulu." }

  let customerId: string | null = null
  let customerName: string | null = null
  let customerEmail: string | null = null
  if (current.isAuthenticated && current.type === "customer") {
    customerId = current.id
    customerName = current.name ?? null
    customerEmail = current.email ?? null
  } else {
    if (!pemesanNama || !pemesanEmail || !pemesanNoTelp) {
      return { message: "Lengkapi data pemesan (nama, email, nomor HP)." }
    }

    const normalizedEmail = pemesanEmail.toLowerCase()

    try {
      const user = await db.users.findUnique({
        where: { email: normalizedEmail },
        include: { staffProfile: true, customerProfile: true },
      })

      if (user?.staffProfile) {
        return { message: "Email sudah digunakan akun staff. Gunakan email lain." }
      }

      if (user) {
        await db.$transaction(async (tx) => {
          await tx.users.update({
            where: { uuid: user.uuid },
            data: { name: pemesanNama, email: normalizedEmail },
          })
          await tx.customerProfile.upsert({
            where: { userId: user.uuid },
            update: { no_telp: pemesanNoTelp },
            create: { userId: user.uuid, no_telp: pemesanNoTelp },
          })
        })

        customerId = user.uuid
        customerName = pemesanNama
        customerEmail = normalizedEmail
      } else {
        const password = `guest_${randomUUID()}`
        const created = await db.users.create({
          data: {
            name: pemesanNama,
            email: normalizedEmail,
            password,
            customerProfile: {
              create: {
                no_telp: pemesanNoTelp,
              },
            },
          },
          select: { uuid: true, name: true, email: true },
        })

        customerId = created.uuid
        customerName = created.name
        customerEmail = created.email
      }

      const cookieStore = await cookies()
      cookieStore.set("userId", customerId)
      cookieStore.set("customerId", customerId)
      cookieStore.set("userType", "customer")
      if (customerName) cookieStore.set("name", customerName)
      if (customerEmail) cookieStore.set("email", customerEmail)
    } catch {
      return { message: "Gagal memproses data pemesan. Silakan coba lagi." }
    }
  }

  if (!customerId) {
    return { message: "Gagal menentukan customer untuk booking." }
  }

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

  let catalogRows: Array<{ uuid: string; nama: string; pk: string | null; harga: number }> = []
  try {
    catalogRows = await db.acServiceCatalog.findMany({
      where: { nama: { in: layananNames } },
      select: { uuid: true, nama: true, pk: true, harga: true },
    })
  } catch {
    return { message: "Katalog layanan belum tersedia. Silakan hubungi admin." }
  }
  const catalog = buildCatalogIndex(catalogRows)
  for (const unit of units) {
    for (const name of unit.layanan) {
      const entry = getCatalogEntry(catalog, name, unit.pk)
      if (!entry) {
        return { message: `Harga layanan "${name}" untuk PK ${unit.pk} belum tersedia.` }
      }
    }
  }

  const jadwalText = jadwalTanggal

  const layananLines = units.map((unit, idx) => {
    const layananText =
      unit.layanan.length === 0
        ? "-"
        : unit.layanan
            .map((name) => {
              const entry = getCatalogEntry(catalog, name, unit.pk) as { harga: number; uuid: string }
              return `${name} (Rp ${entry.harga.toLocaleString("id-ID")})`
            })
            .join(", ")
    return `AC ${idx + 1}: PK ${unit.pk} | Layanan: ${layananText}`
  })

  const layananTotal = units.reduce((sum, unit) => {
    return (
      sum +
      unit.layanan.reduce((inner, name) => {
        const entry = getCatalogEntry(catalog, name, unit.pk)
        if (!entry) return inner
        return inner + entry.harga
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
        customerId,
        jenis_servis: "AC",
        keluhan: keluhanGabungan,
        status: "Booking",
        status_servis: "Booking",
        biaya_dasar: BASE_VISIT_FEE,
        estimasi_biaya: estimasiTotal,
        acUnits: {
          create: units.map((unit) => ({
            pk: unit.pk,
            layanan: {
              create: unit.layanan.map((nama) => {
                const entry = getCatalogEntry(catalog, nama, unit.pk) as { harga: number; uuid: string }
                return { nama, harga: entry.harga, catalogId: entry.uuid }
              }),
            },
          })),
        },
      },
    })
  } catch {
    return { message: "Booking gagal dibuat. Silakan coba lagi." }
  }

  redirect("/listpesanan?tab=history")
}
