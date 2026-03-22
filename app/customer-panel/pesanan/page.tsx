import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { ServiceListTable } from "@/components/dashboard/service-list-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, Plus, Filter, Clock, CheckCircle2, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/pagination"

import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"

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
  searchParams: Promise<{ tab?: string; page?: string }> 
}) {
  const user = await getCurrentUser()
  const { tab, page } = await searchParams
  const activeTab = tab === "history" ? "history" : "ongoing"
  const currentPage = parseInt(page || "1")
  const pageSize = 10

  const whereClause = {
    customerId: user.id,
    status_servis: { in: activeTab === "ongoing" ? ONGOING_STATUSES : HISTORY_STATUSES },
  }

  const [services, ongoingCount, historyCount] = await Promise.all([
    db.services.findMany({
      where: whereClause,
      include: {
        customer: true,
        teknisi: true,
        acUnits: {
          include: {
            layanan: true,
          },
        },
        materialUsages: {
          include: {
            item: { select: { nama: true } },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    db.services.count({ where: { customerId: user.id, status_servis: { in: ONGOING_STATUSES } } }),
    db.services.count({ where: { customerId: user.id, status_servis: { in: HISTORY_STATUSES } } }),
  ])
  
  const totalCount = activeTab === "ongoing" ? ongoingCount : historyCount

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pesanan Saya</h1>
          <DynamicBreadcrumbs />
          <p className="text-slate-500 font-bold text-sm mt-1">Kelola semua pengerjaan servis AC Anda.</p>
        </div>
        <Link href="/booking">
          <Button className="h-11 px-6 rounded-2xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-xs shadow-none gap-2 transition-all">
            <Plus className="h-4 w-4" /> Pesan Servis Baru
          </Button>
        </Link>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="flex w-full max-w-md bg-slate-100 p-1 rounded-2xl h-12 shadow-none border-none">
          <Link href="/customer-panel/pesanan?tab=ongoing" className="contents">
            <TabsTrigger value="ongoing" className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#66B21D] data-[state=active]:shadow-none transition-all gap-2">
              <Clock className="h-4 w-4" /> Berjalan
              {ongoingCount > 0 && (
                <Badge className="h-5 px-2 bg-orange-500 hover:bg-orange-600 text-white border-none animate-pulse">
                  {ongoingCount}
                </Badge>
              )}
            </TabsTrigger>
          </Link>
          <Link href="/customer-panel/pesanan?tab=history" className="contents">
            <TabsTrigger value="history" className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#66B21D] data-[state=active]:shadow-none transition-all gap-2">
              <CheckCircle2 className="h-4 w-4" /> Riwayat
              {historyCount > 0 && (
                <Badge className="h-5 px-2 bg-slate-200 text-slate-500 hover:bg-slate-300 border-none">
                  {historyCount}
                </Badge>
              )}
            </TabsTrigger>
          </Link>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-2 space-y-4">
          <Card className="border-none shadow-none overflow-hidden bg-white">
            <CardHeader className="px-6 py-5 border-none">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-widest">Daftar {activeTab === "ongoing" ? "Pesanan Aktif" : "Riwayat Pesanan"}</CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-400 mt-1">
                    {activeTab === "ongoing" 
                      ? "Pantau progress pengerjaan teknisi secara real-time." 
                      : "Daftar pengerjaan yang sudah selesai atau dibatalkan."}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                    <Input
                      placeholder="Cari ID pesanan..."
                      className="pl-10 h-10 text-xs font-black uppercase tracking-widest bg-slate-50 border-none rounded-xl focus-visible:ring-[#66B21D] shadow-none"
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 border-none bg-slate-50 rounded-xl text-slate-400 hover:text-[#66B21D] hover:bg-green-50 transition-all">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {services.length > 0 ? (
                <div className="overflow-x-auto">
                   <ServiceListTable 
                     data={services} 
                     showNextStep={false} 
                     enableCustomerApproval={activeTab === "ongoing"} 
                     isCustomerView={true} 
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                    <Clock className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Belum ada pesanan</h3>
                  <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto mt-2 leading-relaxed">
                    Sepertinya Anda belum memiliki daftar pesanan di bagian ini.
                  </p>
                  <Link href="/booking" className="mt-8">
                    <Button variant="outline" size="sm" className="h-11 px-8 rounded-xl font-black text-xs border-slate-200 hover:border-[#66B21D] hover:text-[#66B21D] transition-all">Mulai Pesan Layanan</Button>
                  </Link>
                </div>
              )}
            </CardContent>
            
            {services.length > 0 && (
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-none pt-6">
                <p className="text-xs font-bold text-slate-400">
                  Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} dari {totalCount} pesanan
                </p>
                <div>
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/customer-panel/pesanan"
                    searchParams={{ tab: activeTab }}
                  />
                </div>
              </div>
            )}
          </Card>

          {activeTab === "ongoing" && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 border-none flex gap-4">
                <div className="size-10 rounded-2xl bg-white flex items-center justify-center text-[#66B21D] shadow-none shrink-0 font-black text-sm">1</div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900">Pembayaran DP</p>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    Lakukan pembayaran biaya kunjungan Rp 50.000 untuk konfirmasi jadwal kedatangan teknisi ke lokasi Anda.
                  </p>
                </div>
              </div>
              <div className="rounded-3xl bg-white p-6 border-none flex gap-4">
                <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-orange-600 shadow-none shrink-0 font-black text-sm">2</div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900">Pelunasan Servis</p>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    Setelah servis selesai, silakan lakukan pelunasan biaya untuk mengaktifkan masa garansi pengerjaan selama 30 hari.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <Card className="border-none bg-[#66B21D] text-white shadow-none overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <CardContent className="p-6 relative z-10">
                <p className="text-xs font-black uppercase tracking-widest text-[#white/80] flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4" /> Info Garansi
                </p>
                <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <p className="text-sm font-bold leading-relaxed max-w-xl">
                    Pengerjaan dengan status &quot;Selesai (Garansi Aktif)&quot; dapat diklaim jika terjadi masalah dalam 30 hari pengerjaan. Simpan nomor pesanan Anda.
                  </p>
                  <Button variant="secondary" size="sm" className="h-10 px-6 rounded-xl font-black text-xs text-[#66B21D] shrink-0">Pelajari Syarat & Ketentuan</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
