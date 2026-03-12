'use server'

import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export type CurrentUser =
  | { isAuthenticated: true; type: "customer"; id: string; name?: string; email?: string }
  | { isAuthenticated: true; type: "staff"; id: string; role?: string; name?: string; email?: string }
  | { isAuthenticated: false; type: null; id: null }

export async function getCurrentUser(): Promise<CurrentUser> {
  const cookieStore = await cookies()
  const customerId = cookieStore.get("customerId")
  const userId = cookieStore.get("userId")
  const userType = cookieStore.get("userType")
  const role = cookieStore.get("role")
  const name = cookieStore.get("name")
  const email = cookieStore.get("email")

  const id = userId?.value ?? customerId?.value
  if (id) {
    const user = await db.users.findUnique({
      where: { uuid: id },
      select: {
        uuid: true,
        name: true,
        email: true,
        staffProfile: { select: { role: true } },
        customerProfile: { select: { userId: true } },
      },
    })

    if (user?.staffProfile || userType?.value === "staff") {
      return {
        isAuthenticated: true,
        type: "staff",
        id,
        role: user?.staffProfile?.role ?? role?.value,
        name: user?.name ?? name?.value,
        email: user?.email ?? email?.value,
      }
    }

    if (user?.customerProfile || userType?.value === "customer") {
      return {
        isAuthenticated: true,
        type: "customer",
        id,
        name: user?.name ?? name?.value,
        email: user?.email ?? email?.value,
      }
    }
  }

  return {
    isAuthenticated: false,
    type: null,
    id: null
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("customerId")
  cookieStore.delete("userId")
  cookieStore.delete("userType")
  cookieStore.delete("role")
  cookieStore.delete("name")
  cookieStore.delete("email")
  redirect("/")
}
