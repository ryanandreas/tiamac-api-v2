import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, CreditCard, Package, ArrowRight, AlertCircle } from "lucide-react"

const ONGOING_STATUSES = [
  "Menunggu Jadwal",
  "Teknisi Dikonfirmasi",
  "Dalam Pengecekan",
  "Menunggu Persetujuan Customer",
  "Sedang Dikerjakan",
  "Pekerjaan Selesai",
  "Menunggu Pembayaran",
]

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser()
  const displayName = user.isAuthenticated && "name" in user ? user.name : "Customer"

  const activeServices = await db.services.findMany({
    where: {
      customerId: user.id,
      status_servis: { in: ["Booking", ...ONGOING_STATUSES] },
    },
    include: {
      acUnits: {
        include: {
          layanan: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 3,
  })

  const stats = {
    ongoing: await db.services.count({
      where: { customerId: user.id, status_servis: { in: ["Booking", ...ONGOING_STATUSES] } },
    }),
    unpaid: await db.services.count({
      where: {
        customerId: user.id,
        status_servis: { in: ["Booking", "Menunggu Pembayaran"] },
      },
    }),
    completed: await db.services.count({
      where: { customerId: user.id, status_servis: { in: ["Selesai", "Selesai (Garansi Aktif)"] } },
    }),
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Halo, {displayName}! 👋</h1>
        <p className="text-muted-foreground">Selamat datang di panel customer Tiamac. Berikut ringkasan pesanan Anda.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Pesanan Aktif</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ongoing}</div>
            <p className="text-xs text-muted-foreground mt-1">Sedang diproses</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Belum Dibayar</CardTitle>
            <CreditCard className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unpaid}</div>
            <p className="text-xs text-muted-foreground mt-1">Butuh tindakan</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Selesai</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Riwayat servis</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ongoing Orders Widget */}
        <Card className="shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 pb-4">
            <div>
              <CardTitle className="text-base">Pesanan Aktif</CardTitle>
              <CardDescription className="text-xs">Progress servis pengerjaan</CardDescription>
            </div>
            <Link href="/customer-panel/pesanan?tab=ongoing">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                Lihat Semua <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {activeServices.length > 0 ? (
              activeServices.map((service) => (
                <Link key={service.id} href={`/customer-panel/pesanan/${service.id}`}>
                  <div className="group flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {service.id.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">#{service.id.slice(0, 8).toUpperCase()}</p>
                        <Badge 
                          variant={service.status_servis === "Menunggu Pembayaran" || service.status_servis === "Booking" ? "destructive" : "secondary"}
                          className="text-[10px] px-1.5 h-5 font-normal"
                        >
                          {service.status_servis}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {service.keluhan || "Servis AC Routine"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">Tidak ada pesanan aktif</p>
                <Link href="/booking" className="mt-4">
                  <Button size="sm" className="h-8 text-xs">Pesan Servis Baru</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Widget */}
        <Card className="shadow-sm border-muted">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="text-base">Notifikasi Terkini</CardTitle>
            <CardDescription className="text-xs">Pemberitahuan penting akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {stats.unpaid > 0 && (
              <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-destructive">Pembayaran Tertunda</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    Ada {stats.unpaid} pesanan yang menunggu pembayaran awal atau pelunasan.
                  </p>
                  <Link href="/customer-panel/billing">
                    <Button variant="link" size="sm" className="h-auto p-0 text-destructive font-bold mt-1 text-xs underline-offset-4 hover:underline">
                      Bayar Sekarang
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 rounded-lg border p-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Tips Perawatan AC</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  Servis cuci AC rutin setiap 3-4 bulan sekali untuk menjaga efisiensi dan kebersihan udara.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border p-3">
              <div className="h-2 w-2 rounded-full bg-green-500 mt-2 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Jaminan Garansi Tiamac</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  Setiap pengerjaan teknisi kami memiliki garansi selama 30 hari sejak servis selesai.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
