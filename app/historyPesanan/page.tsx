import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { ServiceListTable } from "@/components/dashboard/service-list-table"
import { CustomerPanelNav } from "@/components/customer-panel-nav"
import { SiteNavbar } from "@/components/site-navbar"
import type { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

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

export default async function HistoryPesananPage() {
  const current = await getCurrentUser()
  if (!current.isAuthenticated || current.type !== "customer") {
    redirect("/login")
  }

  const whereClause: Prisma.ServicesWhereInput = {
    customerId: current.id,
    status_servis: { in: HISTORY_STATUSES },
  }

  const services = await db.services.findMany({
    where: whereClause,
    include: {
      customer: true,
      teknisi: true,
      acUnits: {
        include: {
          layanan: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const ongoingCount = await db.services.count({
    where: { customerId: current.id, status_servis: { in: ONGOING_STATUSES } },
  })

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar user={current} mode="sticky" />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <aside className="md:col-span-3">
            <CustomerPanelNav active="history" ongoingCount={ongoingCount} historyCount={services.length} />
            <div className="mt-3 rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">Info</div>
              <p className="mt-1 text-sm">Riwayat pesanan berisi servis selesai, garansi, atau dibatalkan.</p>
            </div>
          </aside>
          <main className="md:col-span-9">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                History Pesanan
              </h2>
            </div>
            <ServiceListTable data={services} showNextStep />
          </main>
        </div>
      </main>
    </div>
  )
}
