import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getCurrentUser } from "@/app/actions/session"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user.isAuthenticated || user.type !== "staff") {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar userRole={user.role} userName={user.name} userEmail={user.email} />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <DashboardHeader user={user} />
        <main className="p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
