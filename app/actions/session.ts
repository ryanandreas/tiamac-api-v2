'use server'

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export type CurrentUser =
  | { isAuthenticated: true; type: "customer"; id: string }
  | { isAuthenticated: true; type: "staff"; id: string; role?: string }
  | { isAuthenticated: false; type: null; id: null }

export async function getCurrentUser(): Promise<CurrentUser> {
  const cookieStore = await cookies()
  const customerId = cookieStore.get("customerId")
  const userId = cookieStore.get("userId")
  const role = cookieStore.get("role")

  if (customerId) {
    return {
      isAuthenticated: true,
      type: "customer",
      id: customerId.value
    }
  }

  if (userId) {
    return {
      isAuthenticated: true,
      type: "staff",
      id: userId.value,
      role: role?.value
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
  redirect("/")
}
