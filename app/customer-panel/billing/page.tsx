import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Receipt, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { OrderDetailDialog } from "@/components/dashboard/order-detail-dialog"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"

export default async function BillingPage() {
  const user = await getCurrentUser()

  const unpaidServices = await db.services.findMany({
    where: {
      customerId: user.id,
      status_servis: { in: ["Booking", "Menunggu Pembayaran"] },
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
  })

  const paidServices = await db.services.findMany({
    where: {
      customerId: user.id,
      status_servis: { in: ["Selesai", "Selesai (Garansi Aktif)", "Sedang Dikerjakan", "Pekerjaan Selesai"] },
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
    take: 15,
  })

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tagihan & Pembayaran</h1>
        <DynamicBreadcrumbs />
        <p className="text-slate-500 font-bold text-sm mt-1">Rekap semua urusan finansial pesanan Anda di satu tempat.</p>
      </div>

      <Tabs defaultValue="unpaid" className="w-full">
        <TabsList className="flex w-full max-w-md bg-slate-100 p-1 rounded-2xl h-12 shadow-inner">
          <TabsTrigger value="unpaid" className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#66B21D] data-[state=active]:shadow-sm transition-all gap-2">
            Belum Dibayar
            {unpaidServices.length > 0 && (
              <Badge className="h-5 px-2 bg-orange-500 text-white border-none animate-pulse">
                {unpaidServices.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#66B21D] data-[state=active]:shadow-sm transition-all gap-2">
            Riwayat
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unpaid" className="space-y-6 mt-8">
          {unpaidServices.length > 0 ? (
            unpaidServices.map((service) => {
              const orderIdShort = service.id.slice(0, 8).toUpperCase()
              const keluhanText = service.keluhan || ""
              const keluhanLines = keluhanText.split("\n")
              const firstEmptyLineIdx = keluhanLines.findIndex((line) => line.trim() === "")
              const keluhanMain =
                firstEmptyLineIdx >= 0 ? keluhanLines.slice(0, firstEmptyLineIdx).join("\n").trim() : keluhanText.trim()
              const alamatLine = keluhanLines.find((line) => line.startsWith("Alamat:"))
              const jadwalLine = keluhanLines.find((line) => line.startsWith("Jadwal:"))
              const catatanLine = keluhanLines.find((line) => line.startsWith("Catatan:"))
              const alamat = alamatLine ? alamatLine.replace(/^Alamat:\s*/, "").trim() : undefined
              const jadwal = jadwalLine ? jadwalLine.replace(/^Jadwal:\s*/, "").trim() : undefined
              const catatan = catatanLine ? catatanLine.replace(/^Catatan:\s*/, "").trim() : undefined

              const biayaKunjungan = service.biaya_dasar ?? 50000
              const receiptRows = [
                { id: "visit-fee", deskripsi: "Biaya kunjungan & diagnosa", pk: "-", harga: biayaKunjungan },
                ...service.acUnits.flatMap((unit, unitIdx) =>
                  unit.layanan.map((layanan) => ({
                    id: layanan.id,
                    deskripsi: `AC ${unitIdx + 1} - ${layanan.nama}`,
                    pk: `PK ${unit.pk}`,
                    harga: layanan.harga,
                  }))
                ),
              ]
              const layananTotal = service.acUnits.reduce(
                (sum, unit) => sum + unit.layanan.reduce((inner, layanan) => inner + layanan.harga, 0),
                0
              )
              const totalEstimasi = biayaKunjungan + layananTotal
              const sisaPembayaran =
                service.status_servis === "Booking" ? biayaKunjungan : Math.max(0, (service.biaya ?? 0) - biayaKunjungan)

              return (
                <Card key={service.id} className="border-none shadow-xl shadow-slate-200/50 overflow-hidden group py-0 gap-0">
                  <div className="bg-orange-50 px-6 py-3 flex items-center justify-between border-b border-orange-100/50 pt-3 pb-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest">
                      <AlertCircle className="h-4 w-4" />
                      Pembayaran Dibutuhkan
                    </div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(service.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <CardContent className="p-6 pt-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2 min-w-0">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-[#66B21D] transition-colors">#{orderIdShort}</p>
                        <h4 className="text-xl font-black text-slate-900 leading-tight">
                          {service.status_servis === "Booking" ? "Biaya Kunjungan (DP)" : "Pelunasan Hasil Servis"}
                        </h4>
                        <p className="text-sm font-bold text-slate-500 max-w-lg">
                          {keluhanMain || "Servis AC Routine Pengecekan & Perbaikan"}
                        </p>
                      </div>
                      <div className="flex flex-col lg:items-end gap-4 shrink-0">
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">
                          {formatRupiah(sisaPembayaran)}
                        </div>
                        <div className="flex items-center gap-3">
                          <OrderDetailDialog
                            orderId={service.id}
                            units={service.acUnits.map((unit) => ({
                              id: unit.id,
                              name: `Unit AC ${unit.pk} PK`,
                              pk: String(unit.pk),
                              serviceName: unit.layanan.map((l) => l.nama).join(", ") || "Servis Routine",
                              price: unit.layanan.reduce((sum, l) => sum + l.harga, 0),
                            }))}
                            biayaDasar={biayaKunjungan}
                            totalBiaya={service.biaya ?? totalEstimasi}
                            trigger={
                              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-200 hover:border-[#66B21D] hover:text-[#66B21D] transition-all">
                                <Receipt className="h-5 w-5" />
                              </Button>
                            }
                          />
                          <Link href={`/customer-panel/pesanan/${service.id}`}>
                            <Button size="sm" className="h-11 px-6 rounded-xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-xs shadow-lg shadow-green-500/20 gap-2">
                              <CreditCard className="h-4 w-4" /> Bayar Sekarang
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
              <div className="size-20 bg-green-50 rounded-3xl flex items-center justify-center mb-6 text-[#66B21D]">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Semua Tagihan Lunas!</h3>
              <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto mt-2 leading-relaxed">
                Hebat! Anda tidak memiliki invoice atau tagihan yang menunggu pembayaran saat ini.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-6 mt-8">
          <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white py-0 gap-0">
            <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30 pt-8 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                <Receipt className="h-4 w-4 text-[#66B21D]" /> Riwayat Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {paidServices.length > 0 ? (
                  paidServices.map((service) => (
                    <div key={service.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-green-100 group-hover:text-[#66B21D] transition-colors">
                          <Receipt className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">#{service.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-base font-black text-slate-900 truncate">Pembayaran Servis AC</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-widest">
                            {new Date(service.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-lg font-black text-slate-900 tracking-tight">
                          {formatRupiah(service.biaya ?? 0)}
                        </div>
                        <Badge className="text-[9px] h-5 rounded-lg font-black bg-green-100 text-[#66B21D] border-none uppercase tracking-widest px-2">
                          SUCCESS
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center">
                    <div className="size-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <Clock className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Belum ada transaksi</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Gateway Info Card */}
      <Card className="border-none bg-slate-900 text-white shadow-2xl shadow-slate-900/20 overflow-hidden relative py-0 gap-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex flex-col md:flex-row items-center gap-6 p-8 pt-10 pb-10 relative z-10">
          <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 shadow-xl border border-white/10">
            <CreditCard className="h-8 w-8 text-[#66B21D]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-lg font-black tracking-tight mb-2">Sistem Pembayaran Pintar</h4>
            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              Mendukung <span className="text-white">Virtual Account, QRIS (Gopay, OVO, Dana), & E-Wallet</span>. Konfirmasi otomatis oleh sistem tanpa perlu unggah bukti manual. Aman, cepat, dan terpercaya.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
