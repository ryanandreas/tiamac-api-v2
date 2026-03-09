import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getCurrentUser } from "@/app/actions/session"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user.isAuthenticated || user.type !== "staff") {
    redirect("/login/staff")
  }

  return (
    <SidebarProvider>
      <AppSidebar userRole={user.role} userName={user.name} userEmail={user.email} />
      {children}
    </SidebarProvider>
  )
}
