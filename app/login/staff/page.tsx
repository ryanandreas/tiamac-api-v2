import { StaffLoginForm } from "@/components/staff-login-form"

export default function StaffLoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <StaffLoginForm />
      </div>
    </div>
  )
}
