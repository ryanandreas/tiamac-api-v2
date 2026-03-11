import Link from "next/link"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { ServiceListTable } from "@/components/dashboard/service-list-table"
import { SiteNavbar } from "@/components/site-navbar"
import type { Prisma } from "@prisma/client"

type SearchParams = { tab?: string }

const ONGOING_STATUSES = [
  "Menunggu Jadwal",
  "Teknisi Dikonfirmasi",
  "Dalam Pengecekan",
  "Menunggu Persetujuan Customer",
  "Sedang Dikerjakan",
  "Pekerjaan Selesai",
  "Menunggu Pembayaran",
]

const HISTORY_STATUSES = ["Booking", "Selesai (Garansi Aktif)", "Selesai", "Dibatalkan"]


export default async function ListPesananPage({ searchParams }: { searchParams?: SearchParams }) {
  const current = await getCurrentUser()
  if (!current.isAuthenticated || current.type !== "customer") {
    redirect("/login")
  }

  const tab = searchParams?.tab ?? "pesanan"

  const whereClause: Prisma.ServicesWhereInput = { customerId: current.id }
  if (tab === "history") {
    whereClause.status_servis = { in: HISTORY_STATUSES }
  } else {
    whereClause.status_servis = { in: ONGOING_STATUSES }
  }

  const services = await db.services.findMany({
    where: whereClause,
    include: {
      customer: true,
      teknisi: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar user={current} mode="sticky" />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <aside className="md:col-span-3">
            <nav className="space-y-1 rounded-lg border bg-card p-2">
              <Link
                href="/listpesanan"
                className={`block rounded px-3 py-2 text-sm ${tab === "pesanan" ? "bg-muted font-medium" : "hover:bg-muted/60"}`}
              >
                Pesanan
              </Link>
              <Link
                href="/listpesanan?tab=history"
                className={`block rounded px-3 py-2 text-sm ${tab === "history" ? "bg-muted font-medium" : "hover:bg-muted/60"}`}
              >
                History
              </Link>
              <Link
                href="/profilcust"
                className={`block rounded px-3 py-2 text-sm hover:bg-muted/60`}
              >
                Profile
              </Link>
            </nav>
            <div className="mt-3 rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">Tips</div>
              <p className="mt-1 text-sm">Pembayaran hanya dapat dilakukan saat status Menunggu Pembayaran.</p>
            </div>
          </aside>
          <main className="md:col-span-9">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                {tab === "history" ? "History Pesanan" : "Pesanan"}
              </h2>
            </div>
            <ServiceListTable data={services} />
          </main>
        </div>
      </main>
    </div>
  )
}
