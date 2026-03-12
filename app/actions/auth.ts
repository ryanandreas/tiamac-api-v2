'use server'

import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export type AuthActionState = { message: string } | null

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { message: "Please fill in all fields" }
  }

  let redirectPath: string | null = null

  try {
    const user = await db.users.findUnique({
      where: { email },
      include: { staffProfile: true, customerProfile: true },
    })

    if (!user) {
      return { message: "User not found" }
    }

    if (user.status !== "ACTIVE") {
      return { message: "Account is disabled" }
    }

    if (user.password !== password) {
      return { message: "Wrong Password" }
    }

    await db.users.update({
      where: { uuid: user.uuid },
      data: { lastLogin: new Date() },
    })

    const cookieStore = await cookies()
    cookieStore.set("userId", user.uuid)
    cookieStore.set("name", user.name)
    cookieStore.set("email", user.email)

    if (user.staffProfile) {
      cookieStore.set("userType", "staff")
      cookieStore.set("role", user.staffProfile.role)
      redirectPath = "/dashboard"
    } else if (user.customerProfile) {
      cookieStore.set("userType", "customer")
      cookieStore.set("customerId", user.uuid)
      redirectPath = "/"
    } else {
      return { message: "User profile not configured" }
    }
  } catch (error) {
    console.error("Login error:", error)
    return { message: error instanceof Error ? error.message : "An unknown error occurred" }
  }

  if (redirectPath) {
    redirect(redirectPath)
  }
}

export async function loginCustomer(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  return login(_prevState, formData)
}

export async function loginStaff(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  return login(_prevState, formData)
}
