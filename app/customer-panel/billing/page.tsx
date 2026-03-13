import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Receipt, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { ServiceReceiptDialog } from "@/components/service-receipt-dialog"

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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tagihan & Pembayaran</h1>
        <p className="text-muted-foreground text-sm">Rekap semua urusan finansial pesanan Anda di satu tempat.</p>
      </div>

      <Tabs defaultValue="unpaid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] shadow-sm">
          <TabsTrigger value="unpaid" className="gap-2 text-xs sm:text-sm">
            Belum Dibayar
            {unpaidServices.length > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 min-w-[1.25rem] font-bold text-[10px] animate-pulse">
                {unpaidServices.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="paid" className="gap-2 text-xs sm:text-sm">
            Riwayat Transaksi
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unpaid" className="space-y-4 mt-6">
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
                <Card key={service.id} className="overflow-hidden border-destructive/20 shadow-sm group hover:shadow-md transition-shadow">
                  <div className="bg-destructive/5 px-4 py-2.5 flex items-center justify-between border-b border-destructive/10">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-destructive uppercase tracking-widest">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Pembayaran Dibutuhkan
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">{new Date(service.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1.5 min-w-0">
                        <p className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">#{orderIdShort}</p>
                        <h4 className="text-base font-bold text-foreground">
                          {service.status_servis === "Booking" ? "Biaya Kunjungan (DP)" : "Pelunasan Hasil Servis"}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                          {keluhanMain || "Servis AC Routine Pengecekan & Perbaikan"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="text-xl font-black text-primary">
                          {formatRupiah(sisaPembayaran)}
                        </div>
                        <div className="flex items-center gap-2">
                          <ServiceReceiptDialog
                            triggerText="Lihat Nota"
                            title="NOTA KONFIRMASI PESANAN"
                            description="Rincian layanan dan estimasi pembayaran."
                            orderId={orderIdShort}
                            createdAtText={new Date(service.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            keluhan={keluhanText}
                            alamat={alamat}
                            jadwal={jadwal}
                            catatan={catatan}
                            rows={receiptRows}
                            layananTotal={layananTotal}
                            biayaKunjungan={biayaKunjungan}
                            totalEstimasi={totalEstimasi}
                            totalFinal={service.biaya ?? null}
                          />
                          <Link href={`/customer-panel/pesanan/${service.id}`}>
                            <Button size="sm" className="gap-2 h-9 px-4 font-bold shadow-sm">
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
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border-2 border-dashed border-muted shadow-none">
              <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Semua Tagihan Lunas!</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2 leading-relaxed">
                Anda tidak memiliki invoice atau tagihan yang menunggu pembayaran saat ini.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4 mt-6">
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" /> Riwayat Pembayaran Berhasil
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-muted">
                {paidServices.length > 0 ? (
                  paidServices.map((service) => (
                    <div key={service.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 shrink-0 border border-green-500/20 shadow-sm">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-muted-foreground leading-none">#{service.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-sm font-bold text-foreground mt-1 truncate">Pembayaran Lunas Servis AC</p>
                          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                            {new Date(service.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-sm font-black text-foreground">
                          {formatRupiah(service.biaya ?? 0)}
                        </div>
                        <Badge variant="outline" className="text-[10px] h-5 font-bold text-green-600 bg-green-50 border-green-200">
                          LUNAS
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center text-muted-foreground">
                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm font-medium">Belum ada riwayat transaksi</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Gateway Info Card */}
      <Card className="bg-primary/5 border-primary/20 shadow-none overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4 p-5">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 shadow-sm">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-primary">Metode Pembayaran Terintegrasi</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
              Kami mendukung pembayaran melalui <span className="font-bold text-foreground">Virtual Account, QRIS (Gopay, OVO, Dana), dan E-Wallet</span>. Pembayaran Anda akan dikonfirmasi secara otomatis oleh sistem kami tanpa perlu unggah bukti manual.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
