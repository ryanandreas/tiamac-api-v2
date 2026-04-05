import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/session"
import { CustomerPanelNavV2 } from "@/components/customer-panel-nav-v2"
import { db } from "@/lib/db"
import { Suspense } from "react"
import { SiteNavbar } from "@/components/site-navbar"
import { SidebarProvider } from "@/components/ui/sidebar"

const ONGOING_STATUSES = [
  "Menunggu Jadwal",
  "Konfirmasi Teknisi",
  "Dalam Pengecekan",
  "Menunggu Persetujuan Customer",
  "Perbaikan Unit",
  "Pekerjaan Selesai",
  "Menunggu Pembayaran",
]

const HISTORY_STATUSES = ["Selesai (Garansi Aktif)", "Selesai", "Dibatalkan"]

export const metadata: Metadata = {
  title: "Customer Panel",
  description: "Kelola pesanan servis AC, pantau status pengerjaan, dan lakukan pembayaran dengan mudah di Tiam AC.",
}

export default async function CustomerPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user.isAuthenticated || user.type !== "customer") {
    redirect("/login")
  }

  const [ongoingCount, historyCount] = await Promise.all([
    db.services.count({
      where: { customerId: user.id, status_servis: { in: ONGOING_STATUSES } },
    }),
    db.services.count({
      where: { customerId: user.id, status_servis: { in: HISTORY_STATUSES } },
    }),
  ])

  // Simple unpaid count for billing badge (Booking or Menunggu Pembayaran)
  const unpaidCount = await db.services.count({
    where: {
      customerId: user.id,
      status_servis: { in: ["Booking", "Perbaikan Unit", "Menunggu Pembayaran"] },
    },
  })

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#f4faef] w-full font-sans">
        <SiteNavbar user={user} mode="sticky" />
        
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 w-full pt-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 w-full">
            {/* Sidebar */}
            <aside className="md:col-span-3">
              <div className="sticky top-28 space-y-6">
                <Suspense fallback={<div className="h-48 w-full animate-pulse bg-slate-100 rounded-3xl" />}>
                  <CustomerPanelNavV2 
                    ongoingCount={ongoingCount} 
                    historyCount={historyCount}
                    unpaidCount={unpaidCount}
                  />
                </Suspense>
                
                <div className="rounded-3xl border-none bg-white p-6 shadow-none relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-100 transition-colors"></div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 relative z-10 flex items-center gap-2 uppercase tracking-widest">
                     <div className="size-1.5 bg-[#66B21D] rounded-full"></div> Butuh Bantuan?
                  </h4>
                  <p className="text-xs text-slate-400 font-bold mb-4 relative z-10 leading-relaxed">
                    Hubungi customer service kami jika Anda memiliki kendala dengan pesanan Anda.
                  </p>
                  <button className="w-full rounded-xl bg-slate-900 px-4 py-3 text-[10px] font-bold text-white hover:bg-[#66B21D] transition-all relative z-10 uppercase tracking-widest shadow-lg shadow-slate-900/10">
                    Hubungi CS Kami
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="md:col-span-9 animate-fade-in">
              {children}
            </main>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
