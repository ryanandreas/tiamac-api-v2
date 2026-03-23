'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

export type CurrentUser =
  | { isAuthenticated: true; type: "customer"; id: string; name?: string; email?: string; profile?: any }
  | { isAuthenticated: true; type: "staff"; id: string; role?: string; name?: string; email?: string }
  | { isAuthenticated: false; type: null; id: null }


export async function getCurrentUser(): Promise<CurrentUser> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session?.user) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        staffProfile: { select: { role: true } },
        customerProfile: { select: { no_telp: true, alamat: true, provinsi: true } },
      },
    })

    if (user?.staffProfile) {
        return {
          isAuthenticated: true,
          type: "staff",
          id: user.id,
          role: user.staffProfile.role,
          name: user.name,
          email: user.email,
        }
    }

    return {
        isAuthenticated: true,
        type: "customer",
        id: user?.id ?? session.user.id,
        name: user?.name ?? session.user.name,
        email: user?.email ?? session.user.email,
        profile: user?.customerProfile,
    }

  }

  // FALLBACK: Keep manual cookies for now during transition 
  const cookieStore = await cookies()
  const customerId = cookieStore.get("customerId")
  const userId = cookieStore.get("userId")
  const userType = cookieStore.get("userType")
  const role = cookieStore.get("role")
  const name = cookieStore.get("name")
  const email = cookieStore.get("email")

  const id = userId?.value ?? customerId?.value
  if (id) {
    const user = await db.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        staffProfile: { select: { role: true } },
        customerProfile: { select: { no_telp: true, alamat: true, provinsi: true } },
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
        profile: user?.customerProfile,
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
  
  // Also logout Better Auth
  await auth.api.signOut({
    headers: await headers()
  });

  redirect("/")
}

