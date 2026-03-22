import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getCurrentUser } from "@/app/actions/session"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { db } from "@/lib/db"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user.isAuthenticated || user.type !== "staff") {
    redirect("/login")
  }

  // Fetch counts for sidebar badges
  const [bookingCount, jadwalCount, servisCount] = await Promise.all([
    db.services.count({ where: { status_servis: "Booking" } }),
    db.services.count({ where: { status_servis: "Menunggu Jadwal" } }),
    db.services.count({ 
      where: { 
        status_servis: { 
          in: [
            "Teknisi Dikonfirmasi", 
            "Dalam Pengecekan", 
            "Menunggu Persetujuan Customer", 
            "Sedang Dikerjakan", 
            "Pekerjaan Selesai", 
            "Menunggu Pembayaran"
          ] 
        } 
      } 
    })
  ])

  const badgeCounts = {
    booking: bookingCount,
    jadwal: jadwalCount,
    servis: servisCount
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        userRole={user.role} 
        userName={user.name} 
        userEmail={user.email} 
        badgeCounts={badgeCounts}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#66B21D]/15 via-slate-100 to-slate-200/30">
        <DashboardHeader user={user} />
        <main className="p-4 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
