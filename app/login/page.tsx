import { LoginForm } from "@/components/login-form"
import { getCurrentUser } from "@/app/actions/session"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user.isAuthenticated) {
    redirect(user.type === "staff" ? "/dashboard" : "/")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  )
}
