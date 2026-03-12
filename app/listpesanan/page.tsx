import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { ServiceListTable } from "@/components/dashboard/service-list-table"
import { CustomerPanelNav } from "@/components/customer-panel-nav"
import { SiteNavbar } from "@/components/site-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

const ONGOING_STATUSES = [
  "Booking",
  "Menunggu Jadwal",
  "Teknisi Dikonfirmasi",
  "Dalam Pengecekan",
  "Menunggu Persetujuan Customer",
  "Sedang Dikerjakan",
  "Pekerjaan Selesai",
  "Menunggu Pembayaran",
]

const HISTORY_STATUSES = ["Selesai (Garansi Aktif)", "Selesai", "Dibatalkan"]

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default async function ListPesananPage() {
  const current = await getCurrentUser()
  if (!current.isAuthenticated || current.type !== "customer") {
    redirect("/login")
  }

  const whereClause: Prisma.ServicesWhereInput = {
    customerId: current.id,
    status_servis: { in: ONGOING_STATUSES },
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

  const bookingCount = services.filter((s) => s.status_servis === "Booking").length
  const waitingPaymentOrders = services.filter((s) => s.status_servis === "Menunggu Pembayaran")
  const waitingPaymentCount = waitingPaymentOrders.length
  const inProgressCount = services.length - bookingCount - waitingPaymentCount
  const waitingPaymentTotal = waitingPaymentOrders.reduce(
    (sum, s) => sum + (s.biaya ?? s.estimasi_biaya ?? 0),
    0
  )

  const historyCount = await db.services.count({
    where: { customerId: current.id, status_servis: { in: HISTORY_STATUSES } },
  })

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar user={current} mode="sticky" />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <aside className="md:col-span-3">
            <CustomerPanelNav
              active="pesanan"
              ongoingCount={services.length}
              historyCount={historyCount}
              highlightOngoing={bookingCount > 0 || waitingPaymentCount > 0}
            />
            <div className="mt-3 rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">Alur</div>
              <p className="mt-1 text-sm">
                Bayar biaya kunjungan Rp 50.000 → teknisi proses & hitung biaya → bayar invoice → selesai.
              </p>
            </div>
          </aside>
          <main className="md:col-span-9">
            <div className="mb-4 space-y-1">
              <h2 className="text-lg font-semibold">Pesanan</h2>
              <p className="text-sm text-muted-foreground">
                Pantau progress servis dan lakukan pembayaran saat diperlukan.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className={bookingCount > 0 ? "border-destructive/30 bg-destructive/5" : undefined}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Bayar DP (Rp 50.000)</CardTitle>
                  <CardDescription>Pesanan baru yang menunggu biaya kunjungan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold">{bookingCount}</div>
                  <div className="text-xs text-muted-foreground">
                    Setelah DP dibayar, admin/teknisi akan menjadwalkan dan memproses pesanan.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Sedang Diproses</CardTitle>
                  <CardDescription>Pesanan dalam pengecekan / pengerjaan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold">{Math.max(0, inProgressCount)}</div>
                  <div className="text-xs text-muted-foreground">
                    Lihat status untuk mengetahui tahap terbaru dari teknisi.
                  </div>
                </CardContent>
              </Card>

              <Card className={waitingPaymentCount > 0 ? "border-primary/30 bg-primary/5" : undefined}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Menunggu Pembayaran</CardTitle>
                  <CardDescription>Tagihan servis sudah dihitung teknisi.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-2xl font-bold">{waitingPaymentCount}</div>
                  <div className="text-xs text-muted-foreground">
                    Estimasi total tagihan: {formatRupiah(waitingPaymentTotal)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <ServiceListTable data={services} showNextStep />
            </div>
          </main>
        </div>
      </main>
    </div>
  )
}
