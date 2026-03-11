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
  const role = cookieStore.get("role")
  const name = cookieStore.get("name")
  const email = cookieStore.get("email")

  if (customerId) {
    const customer = await db.customers.findUnique({
      where: { uuid: customerId.value },
      select: { name: true, email: true },
    })

    return {
      isAuthenticated: true,
      type: "customer",
      id: customerId.value,
      name: customer?.name ?? undefined,
      email: customer?.email ?? undefined,
    }
  }

  if (userId) {
    return {
      isAuthenticated: true,
      type: "staff",
      id: userId.value,
      role: role?.value,
      name: name?.value,
      email: email?.value
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
  cookieStore.delete("role")
  cookieStore.delete("name")
  cookieStore.delete("email")
  redirect("/")
}
