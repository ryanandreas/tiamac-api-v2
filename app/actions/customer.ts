'use server'

import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"

export type CustomerProfileActionState = { message: string } | null

export async function updateCustomerProfile(
  _prevState: CustomerProfileActionState,
  formData: FormData
): Promise<CustomerProfileActionState> {
  const current = await getCurrentUser()
  if (!current.isAuthenticated || current.type !== "customer") {
    return { message: "Unauthorized" }
  }

  const name = (formData.get("name") as string | null)?.trim()
  const email = (formData.get("email") as string | null)?.trim()
  const no_telp = (formData.get("no_telp") as string | null)?.trim()
  const provinsi = (formData.get("provinsi") as string | null)?.trim()
  const alamat = (formData.get("alamat") as string | null)?.trim()
  const password = (formData.get("password") as string | null)?.trim()

  if (!name || !email || !no_telp) {
    return { message: "Nama, email, dan no. telp wajib diisi." }
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.users.update({
        where: { uuid: current.id },
        data: {
          name,
          email,
          ...(password ? { password } : {}),
        },
      })

      await tx.customerProfile.upsert({
        where: { userId: current.id },
        update: {
          no_telp,
          provinsi: provinsi || null,
          alamat: alamat || null,
        },
        create: {
          userId: current.id,
          no_telp,
          provinsi: provinsi || null,
          alamat: alamat || null,
        },
      })
    })
  } catch {
    return { message: "Gagal menyimpan profil. Pastikan email belum dipakai." }
  }

  return { message: "Profil berhasil disimpan." }
}
