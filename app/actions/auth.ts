'use server'

import { redirect } from "next/navigation"
import { AuthService } from "@/lib/services/auth-service"
import { cookies } from "next/headers"

export type AuthActionState = { success: boolean; message: string } | null

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const user = await AuthService.validateUser({ email, password })
    await AuthService.updateLastLogin(user.uuid)
    
    // Set Session Cookies (Action Layer responsibility)
    const cookieStore = await cookies()
    cookieStore.set("userId", user.uuid)
    cookieStore.set("name", user.name)
    cookieStore.set("email", user.email)

    if (user.staffProfile) {
      cookieStore.set("userType", "staff")
      cookieStore.set("role", user.staffProfile.role)
    } else if (user.customerProfile) {
      cookieStore.set("userType", "customer")
      cookieStore.set("customerId", user.uuid)
    }

    if (user.staffProfile) {
      redirect("/dashboard")
    } else {
      redirect("/")
    }
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Login error:", error)
    return { success: false, message: error.message || "Terjadi kesalahan internal" }
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

