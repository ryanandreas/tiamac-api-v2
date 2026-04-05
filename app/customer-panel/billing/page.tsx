import type { Metadata } from "next"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Receipt, AlertCircle, CheckCircle2, Clock, ArrowRight, Eye } from "lucide-react"
import Link from "next/link"
import { ServiceStatusHistoryDialog } from "@/components/dashboard/service-status-history-dialog"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Pagination } from "@/components/pagination"

export const metadata: Metadata = {
  title: "Tagihan & Pembayaran",
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const user = await getCurrentUser()
  const { tab, page } = await searchParams
  const activeTab = tab === "paid" ? "paid" : "unpaid"
  const currentPage = parseInt(page || "1")
  const pageSize = 5

  const unpaidWhere = {
    customerId: user.id,
    status_servis: { in: ["Booking", "Perbaikan Unit", "Menunggu Pembayaran"] },
  }

  const paidWhere = {
    customerId: user.id,
    status_servis: { in: ["Selesai", "Selesai (Garansi Aktif)", "Pekerjaan Selesai"] },
  }

  const [unpaidServices, unpaidTotal, paidServices, paidTotal] = await Promise.all([
    db.services.findMany({
      where: unpaidWhere,
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
      skip: activeTab === "unpaid" ? (currentPage - 1) * pageSize : 0,
      take: activeTab === "unpaid" ? pageSize : 100, 
    }),
    db.services.count({ where: unpaidWhere }),
    db.services.findMany({
      where: paidWhere,
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
      skip: activeTab === "paid" ? (currentPage - 1) * pageSize : 0,
      take: activeTab === "paid" ? pageSize : 10,
    }),
    db.services.count({ where: paidWhere }),
  ])

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white px-6 py-4 rounded-3xl flex flex-col gap-1 border-none shadow-none">
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Tagihan & Pembayaran</h1>
        <DynamicBreadcrumbs />
        <p className="text-slate-500 font-medium text-sm mt-1">Rekap semua urusan finansial pesanan Anda di satu panel kendali.</p>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="flex w-full max-w-md bg-white p-1 rounded-2xl h-12 shadow-none border-none mb-2">
          <Link href="/customer-panel/billing?tab=unpaid" className="contents">
            <TabsTrigger value="unpaid" className="flex-1 rounded-xl font-semibold text-sm data-[state=active]:bg-green-50 data-[state=active]:text-[#66B21D] data-[state=active]:shadow-none transition-all gap-2">
              Belum Dibayar
              {unpaidTotal > 0 && (
                <Badge className="h-5 px-2 bg-orange-500 text-white border-none animate-pulse">
                  {unpaidTotal}
                </Badge>
              )}
            </TabsTrigger>
          </Link>
          <Link href="/customer-panel/billing?tab=paid" className="contents">
            <TabsTrigger value="paid" className="flex-1 rounded-xl font-semibold text-sm data-[state=active]:bg-green-50 data-[state=active]:text-[#66B21D] data-[state=active]:shadow-none transition-all gap-2">
              Riwayat
            </TabsTrigger>
          </Link>
        </TabsList>
        
        <TabsContent value="unpaid" className="space-y-4 mt-0">
          {unpaidServices.length > 0 ? (
            <>
              {unpaidServices.map((service) => {
                const orderIdShort = service.id.slice(0, 8).toUpperCase()
                const keluhanText = service.keluhan || ""
                const keluhanLines = keluhanText.split("\n")
                // Only show the first line to keep it clean, as technicians append metadata later
                const keluhanMain = keluhanLines[0]?.trim() || "Routine Cleaning & Repair"

                const biayaKunjungan = service.biaya_dasar ?? 50000
                const layananTotal = service.acUnits.reduce(
                  (sum, unit) => sum + unit.layanan.reduce((inner, layanan) => inner + layanan.harga, 0),
                  0
                )
                const totalEstimasi = biayaKunjungan + layananTotal
                const totalFinal = service.biaya ?? service.estimasi_biaya ?? totalEstimasi
                const sisaPembayaran =
                  service.status_servis === "Booking" ? biayaKunjungan : Math.max(0, totalFinal - biayaKunjungan)

                return (
                  <Card key={service.id} className="border-none shadow-none overflow-hidden group !py-0 gap-0 bg-white">
                    <div className="bg-orange-50/50 px-6 py-2.5 flex items-center justify-between border-none">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        Pembayaran Dinantikan
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{new Date(service.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <CardContent className="p-6 pt-6 pb-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2 min-w-0">
                          <p className="text-xs font-semibold text-slate-400 group-hover:text-[#66B21D] transition-colors">#{orderIdShort}</p>
                          <h4 className="text-xl font-bold text-slate-900 leading-tight">
                            {service.status_servis === "Booking" ? "Biaya Kunjungan (DP)" : "Pelunasan Hasil Servis"}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-slate-100/50 text-slate-400 border-slate-200/50 uppercase tracking-widest">
                               {service.status_servis}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col lg:items-end gap-3 shrink-0">
                          <div className="text-3xl font-bold text-slate-900 tracking-tight">
                            {formatRupiah(sisaPembayaran)}
                          </div>
                          <div className="flex items-center gap-2">
                             <ServiceStatusHistoryDialog
                               serviceId={service.id}
                               trigger={
                                 <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl border-none bg-slate-50 hover:bg-green-50 hover:text-[#66B21D] transition-all">
                                   <Eye className="h-4.5 w-4.5" />
                                 </Button>
                               }
                             />
                            <Link href={`/customer-panel/pesanan/${service.id}`}>
                              <Button size="sm" className="h-10 px-6 rounded-xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-bold text-xs shadow-none gap-2">
                                <CreditCard className="h-4 w-4" /> Bayar Sekarang
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {unpaidTotal > 0 && (
                <div className="pt-2 flex justify-between items-center border-none mt-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, unpaidTotal)} dari {unpaidTotal} tagihan
                  </p>
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(unpaidTotal / pageSize)}
                    baseUrl="/customer-panel/billing"
                    searchParams={{ tab: "unpaid" }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl shadow-none border-none">
              <div className="size-20 bg-green-50 rounded-3xl flex items-center justify-center mb-6 text-[#66B21D]">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Semua Tagihan Lunas!</h3>
              <p className="text-sm text-slate-400 font-semibold max-w-xs mx-auto mt-2 leading-relaxed">
                Hebat! Anda tidak memiliki invoice atau tagihan yang menunggu pembayaran saat ini.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4 mt-0">
          <Card className="border-none shadow-none overflow-hidden bg-white !py-0 gap-0">
            <CardHeader className="p-6 border-none pt-5 pb-2">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-4.5 w-4.5 text-[#66B21D]" /> Riwayat Transaksi
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">Daftar pembayaran yang telah terverifikasi sistem.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {paidServices.length > 0 ? (
                  <>
                    {paidServices.map((service) => (
                      <div key={service.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/30 transition-colors group">
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="size-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 shrink-0 group-hover:bg-green-50 group-hover:text-[#66B21D] transition-colors">
                            <Receipt className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-300 leading-none mb-1">#{service.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-base font-bold text-slate-900 truncate">Order Payment</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                              {new Date(service.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div className="text-lg font-bold text-slate-900 tracking-tight">
                            {formatRupiah(service.biaya ?? 0)}
                          </div>
                          <Badge className="text-[9px] h-5 rounded-lg font-bold bg-green-50 text-[#66B21D] border-none px-2 shadow-none">
                            Success
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {paidTotal > 0 && (
                      <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-50">
                        <p className="text-xs font-semibold text-slate-400">
                          Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, paidTotal)} dari {paidTotal} transaksi
                        </p>
                        <Pagination 
                          currentPage={currentPage}
                          totalPages={Math.ceil(paidTotal / pageSize)}
                          baseUrl="/customer-panel/billing"
                          searchParams={{ tab: "paid" }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-24 text-center">
                    <div className="size-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <Clock className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-semibold text-slate-400">Belum ada transaksi</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  )
}
