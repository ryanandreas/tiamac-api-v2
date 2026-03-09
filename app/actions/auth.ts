'use server'

import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginCustomer(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { message: "Please fill in all fields" }
  }

  try {
    const customer = await db.customers.findUnique({
      where: { email },
    })

    if (!customer) {
      return { message: "Customer not found" }
    }

    // Plain text password comparison as per reference project
    if (customer.password !== password) {
      return { message: "Wrong Password" }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("customerId", customer.uuid)
    
    // You might want to store more session info or use a proper session library
  } catch (error) {
    return { message: "An error occurred during login" }
  }

  redirect("/")
}

export async function loginStaff(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { message: "Please fill in all fields" }
  }

  try {
    const user = await db.users.findUnique({
      where: { email },
    })

    if (!user) {
      return { message: "User not found" }
    }

    // Plain text password comparison as per reference project
    if (user.password !== password) {
      return { message: "Wrong Password" }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("userId", user.uuid)
    cookieStore.set("role", user.role)

  } catch (error) {
    return { message: "An error occurred during login" }
  }

  redirect("/dashboard") // Assuming staff goes to dashboard
}
