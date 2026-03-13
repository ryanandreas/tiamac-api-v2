import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/session"
import { SiteNavbar } from "@/components/site-navbar"
import { CustomerPanelNavV2 } from "@/components/customer-panel-nav-v2"
import { db } from "@/lib/db"
import { Suspense } from "react"

const ONGOING_STATUSES = [
  "Menunggu Jadwal",
  "Teknisi Dikonfirmasi",
  "Dalam Pengecekan",
  "Menunggu Persetujuan Customer",
  "Sedang Dikerjakan",
  "Pekerjaan Selesai",
  "Menunggu Pembayaran",
]

const HISTORY_STATUSES = ["Selesai (Garansi Aktif)", "Selesai", "Dibatalkan"]

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
      status_servis: { in: ["Booking", "Menunggu Pembayaran"] },
    },
  })

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteNavbar user={user} mode="sticky" />
      
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Sidebar */}
          <aside className="md:col-span-3">
            <div className="sticky top-20 space-y-4">
              <Suspense fallback={<div className="h-48 w-full animate-pulse bg-muted rounded-xl" />}>
                <CustomerPanelNavV2 
                  ongoingCount={ongoingCount} 
                  historyCount={historyCount}
                  unpaidCount={unpaidCount}
                />
              </Suspense>
              
              <div className="rounded-xl border bg-primary/5 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-primary mb-2">Butuh Bantuan?</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Hubungi customer service kami jika Anda memiliki kendala dengan pesanan Anda.
                </p>
                <button className="w-full rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  Hubungi CS
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-9">
            {children}
          </main>
        </div>
      </main>
    </div>
  )
}
