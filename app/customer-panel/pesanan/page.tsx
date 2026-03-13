import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { ServiceListTable } from "@/components/dashboard/service-list-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search, Plus, Filter, Clock, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"

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

export default async function MyOrdersPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  const user = await getCurrentUser()
  const { tab } = await searchParams
  const activeTab = tab === "history" ? "history" : "ongoing"

  const [ongoingServices, historyServices] = await Promise.all([
    db.services.findMany({
      where: {
        customerId: user.id,
        status_servis: { in: ONGOING_STATUSES },
      },
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
        updatedAt: "desc",
      },
    }),
    db.services.findMany({
      where: {
        customerId: user.id,
        status_servis: { in: HISTORY_STATUSES },
      },
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
        updatedAt: "desc",
      },
      take: 20,
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pesanan Saya</h1>
          <p className="text-muted-foreground">Kelola semua pengerjaan servis AC Anda.</p>
        </div>
        <Link href="/booking">
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> Pesan Servis Baru
          </Button>
        </Link>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] shadow-sm">
          <Link href="/customer-panel/pesanan?tab=ongoing" className="contents">
            <TabsTrigger value="ongoing" className="gap-2 text-xs sm:text-sm w-full">
              <Clock className="h-3.5 w-3.5" /> Sedang Berjalan
            </TabsTrigger>
          </Link>
          <Link href="/customer-panel/pesanan?tab=history" className="contents">
            <TabsTrigger value="history" className="gap-2 text-xs sm:text-sm w-full">
              <CheckCircle2 className="h-3.5 w-3.5" /> Riwayat & Selesai
            </TabsTrigger>
          </Link>
        </TabsList>
        
        <TabsContent value="ongoing" className="mt-6 space-y-4">
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Daftar Pesanan Aktif</CardTitle>
                  <CardDescription className="text-xs">Pantau progress pengerjaan teknisi secara real-time.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari ID pesanan..."
                      className="pl-8 h-9 text-xs sm:text-sm shadow-none focus-visible:ring-primary"
                    />
                  </div>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 shadow-sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {ongoingServices.length > 0 ? (
                <div className="overflow-x-auto">
                   <ServiceListTable data={ongoingServices} showNextStep />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-lg font-semibold">Tidak ada pesanan aktif</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
                    Anda tidak memiliki pesanan yang sedang diproses saat ini.
                  </p>
                  <Link href="/booking" className="mt-6">
                    <Button variant="outline" size="sm" className="h-9 shadow-sm">Mulai Pesan Layanan</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Info Alur Mini */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-blue-500/5 p-4 border-blue-500/20 flex gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">1</div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-700">Pembayaran DP</p>
                <p className="text-xs text-blue-600/80 leading-relaxed">
                  Lakukan pembayaran biaya kunjungan Rp 50.000 untuk konfirmasi jadwal kedatangan teknisi.
                </p>
              </div>
            </div>
            <div className="rounded-xl border bg-amber-500/5 p-4 border-amber-500/20 flex gap-3">
              <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">2</div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-700">Pelunasan Servis</p>
                <p className="text-xs text-amber-600/80 leading-relaxed">
                  Setelah servis selesai, silakan lakukan pelunasan biaya untuk mengaktifkan masa garansi Anda.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-4">
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Riwayat Pesanan</CardTitle>
                  <CardDescription className="text-xs">Daftar pengerjaan yang sudah selesai atau dibatalkan.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari ID pesanan..."
                      className="pl-8 h-9 text-xs sm:text-sm shadow-none focus-visible:ring-primary"
                    />
                  </div>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 shadow-sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {historyServices.length > 0 ? (
                <div className="overflow-x-auto">
                   <ServiceListTable data={historyServices} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-lg font-semibold">Belum ada riwayat</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
                    Anda belum pernah menyelesaikan pesanan atau membatalkan pesanan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="rounded-xl border bg-green-500/5 p-4 border-green-500/20">
            <p className="text-xs text-green-700/80 leading-relaxed">
              <span className="font-bold">Info Garansi:</span> Pengerjaan dengan status &quot;Selesai (Garansi Aktif)&quot; dapat diklaim jika terjadi masalah dalam 30 hari pengerjaan.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
