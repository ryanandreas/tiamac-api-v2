'use server'

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/session"
import { cookies } from "next/headers"
import { BookingService } from "@/lib/services/booking-service"
import { UserService } from "@/lib/services/user-service"
import { db } from "@/lib/db"

export type CreateBookingState = { success: boolean; message: string } | null

export async function createAcBooking(
  _prevState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const current = await getCurrentUser()
  if (current.isAuthenticated && current.type === "staff") {
    return { success: false, message: "Akun staff tidak dapat membuat booking secara langsung." }
  }

  // 1. Parse Input
  const keluhan = (formData.get("keluhan") as string | null)?.trim() || ""
  const alamat = (formData.get("alamat") as string | null)?.trim() || ""
  const jadwalTanggal = (formData.get("jadwal_tanggal") as string | null)?.trim() || ""
  const agree = formData.get("agree_biaya_kunjungan") === "on"
  const unitsJson = (formData.get("units_json") as string | null)?.trim() || "[]"
  
  const pemesanNama = (formData.get("pemesan_nama") as string | null)?.trim()
  const pemesanEmail = (formData.get("pemesan_email") as string | null)?.trim()
  const pemesanNoTelp = (formData.get("pemesan_no_telp") as string | null)?.trim()

  if (!agree) return { success: false, message: "Anda harus menyetujui biaya kunjungan & diagnosa." }

  let customerId: string | null = null

  // 2. User / Guest Management
  if (current.isAuthenticated && current.type === "customer") {
    customerId = current.id
  } else {
    // Guest flow
    if (!pemesanNama || !pemesanEmail || !pemesanNoTelp) {
        return { success: false, message: "Lengkapi data pemesan (nama, email, nomor HP)." }
    }

    try {
      const user = await UserService.registerOrUpdateGuest({
        name: pemesanNama,
        email: pemesanEmail,
        no_telp: pemesanNoTelp,
      })
      
      customerId = user.id
      
      // Action responsibility: set cookies
      const cookieStore = await cookies()
      cookieStore.set("userId", user.id)
      cookieStore.set("customerId", user.id)
      cookieStore.set("userType", "customer")
      cookieStore.set("name", user.name)
      cookieStore.set("email", user.email)
    } catch (err: any) {
      return { success: false, message: err.message || "Gagal memproses data pemesan." }
    }
  }

  // 3. Prepare units and call service
  try {
    const units = JSON.parse(unitsJson)
    await BookingService.createBooking({
      customerId: customerId!,
      units,
      keluhan,
      alamat,
      jadwalTanggal,
    })
  } catch (err: any) {
    console.error("Booking Action Error:", err)
    return { success: false, message: err.message || "Gagal membuat pesanan." }
  }

  redirect("/customer-panel/pesanan")
}

export async function getServiceDetail(serviceId: string) {
  return await db.services.findUnique({
    where: { id: serviceId },
    include: {
      customer: {
        include: {
          customerProfile: true
        }
      },
      teknisi: true,
      acUnits: {
        include: {
          layanan: true
        }
      },
      statusHistory: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  })
}


