"use server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Info,
  MapPin,
  Package,
  Smartphone,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ServiceReceiptDialog } from "@/components/service-receipt-dialog"
import { PaymentMethodChooser } from "@/components/payment-method-chooser"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user.isAuthenticated || user.type !== "customer") {
    redirect("/login")
  }

  const { id } = await params

  const service = await db.services.findUnique({
    where: { id },
    include: {
      customer: { include: { customerProfile: true } },
      teknisi: true,
      acUnits: {
        include: {
          layanan: true,
        },
      },
    },
  })

  if (!service) notFound()
  if (service.customerId !== user.id) redirect("/customer-panel/dashboard")

  const orderIdShort = service.id.slice(0, 8).toUpperCase()

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)

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

  const profileAlamat = service.customer?.customerProfile?.alamat ?? undefined
  const profileProvinsi = service.customer?.customerProfile?.provinsi ?? undefined
  const alamatText = [profileAlamat ?? alamat, profileProvinsi].filter(Boolean).join(", ")

  const rawPhone = service.customer?.customerProfile?.no_telp ?? ""
  const phoneText = rawPhone
    ? rawPhone.startsWith("+")
      ? rawPhone
      : rawPhone.startsWith("62")
        ? `+${rawPhone}`
        : rawPhone.startsWith("0")
          ? `+62${rawPhone.slice(1)}`
          : rawPhone
    : "-"

  const biayaKunjungan = service.biaya_dasar ?? 50000
  const layananTotal = service.acUnits.reduce(
    (sum, unit) => sum + unit.layanan.reduce((inner, layanan) => inner + layanan.harga, 0),
    0
  )
  const totalEstimasi = biayaKunjungan + layananTotal

  const dpAmount = biayaKunjungan
  const pelunasanAmount = Math.max(0, (service.biaya ?? 0) - biayaKunjungan)

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

  const isInProgress = [
    "Menunggu Jadwal",
    "Teknisi Dikonfirmasi",
    "Dalam Pengecekan",
    "Menunggu Persetujuan Customer",
    "Sedang Dikerjakan",
  ].includes(service.status_servis)

  const isFinalPayment = ["Pekerjaan Selesai", "Menunggu Pembayaran"].includes(service.status_servis)
  const isCompleted = ["Selesai", "Selesai (Garansi Aktif)"].includes(service.status_servis)

  const steps = [
    { id: "created", label: "Pesanan Dibuat" },
    { id: "dp", label: "DP/Biaya Awal" },
    { id: "process", label: "Diproses" },
    { id: "final", label: "Pelunasan" },
    { id: "done", label: "Selesai" },
  ] as const

  const stepStatus = (stepId: (typeof steps)[number]["id"]) => {
    if (stepId === "created") return "completed" as const

    if (stepId === "dp") {
      return service.status_servis === "Booking" ? ("active" as const) : ("completed" as const)
    }

    if (stepId === "process") {
      if (service.status_servis === "Booking") return "pending" as const
      if (isInProgress) return "active" as const
      return "completed" as const
    }

    if (stepId === "final") {
      if (service.status_servis === "Booking" || isInProgress) return "pending" as const
      if (isFinalPayment) return "active" as const
      if (isCompleted) return "completed" as const
      return "pending" as const
    }

    if (stepId === "done") {
      return isCompleted ? ("completed" as const) : ("pending" as const)
    }

    return "pending" as const
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/customer-panel/pesanan?tab=ongoing" className="hover:underline">
              Pesanan
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">#{orderIdShort}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Detail Pesanan</h1>
        </div>
        <Badge variant="secondary" className="text-xs font-semibold">
          {service.status_servis}
        </Badge>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Progress Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-muted" />
            <div className="grid grid-cols-5 gap-2">
              {steps.map((s, idx) => {
                const status = stepStatus(s.id)
                return (
                  <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full border-4 bg-background flex items-center justify-center transition-all duration-300",
                        status === "completed"
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : status === "active"
                            ? "border-primary text-primary ring-4 ring-primary/10 shadow-sm"
                            : "border-muted text-muted-foreground"
                      )}
                    >
                      {status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                    </div>
                    <div
                      className={cn(
                        "text-[10px] sm:text-xs font-medium text-center px-1 leading-tight",
                        status === "active"
                          ? "text-primary font-bold"
                          : status === "completed"
                            ? "text-foreground"
                            : "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-muted/30 border-b py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Rincian Layanan & Teknis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div className="space-y-1.5">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Keluhan</div>
                  <div className="text-sm font-semibold leading-relaxed whitespace-pre-wrap break-words">{keluhanMain || "-"}</div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Jadwal Servis</div>
                  <div className="text-sm font-semibold">{jadwal || "-"}</div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Estimasi Selesai</div>
                  <div className="text-sm font-semibold">Tergantung pengerjaan teknisi</div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Teknisi Bertugas</div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {service.teknisi?.name?.slice(0, 2).toUpperCase() || "UN"}
                    </div>
                    <div className="text-sm font-semibold">{service.teknisi?.name || "Menunggu Teknisi"}</div>
                  </div>
                </div>
              </div>

              <Separator className="bg-muted" />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    Daftar Unit AC & Layanan Terkait
                  </div>
                  <ServiceReceiptDialog
                    triggerText="Lihat Nota Lengkap"
                    title="NOTA KONFIRMASI PESANAN"
                    description="Rincian layanan dan estimasi pembayaran."
                    orderId={orderIdShort}
                    createdAtText={new Date(service.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    keluhan={keluhanText}
                    alamat={alamatText || alamat}
                    jadwal={jadwal}
                    catatan={catatan}
                    rows={receiptRows}
                    layananTotal={layananTotal}
                    biayaKunjungan={biayaKunjungan}
                    totalEstimasi={totalEstimasi}
                    totalFinal={service.biaya ?? null}
                  />
                </div>
                <div className="space-y-3">
                  {service.acUnits.map((unit, idx) => (
                    <div key={unit.id} className="rounded-xl border border-muted bg-muted/10 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-bold flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" /> Unit #{idx + 1} - {unit.pk} PK
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-normal h-5">
                          AC Unit
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {unit.layanan.map((layanan) => (
                          <div key={layanan.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{layanan.nama}</span>
                            <span className="font-bold">{formatRupiah(layanan.harga)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted">
            <CardHeader className="bg-muted/30 border-b py-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Informasi Lokasi & Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <div className="text-sm font-bold text-foreground">{service.customer?.name}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed max-w-md whitespace-pre-wrap break-words">
                    {alamatText || "Alamat belum tersedia."}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Smartphone className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium">{phoneText}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            className={cn(
              "shadow-lg border-2",
              service.status_servis === "Booking" || service.status_servis === "Menunggu Pembayaran"
                ? "border-destructive/30 ring-4 ring-destructive/5"
                : "border-primary/20"
            )}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Ringkasan Finansial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {service.status_servis === "Booking" && (
                <>
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-destructive text-xs font-bold uppercase tracking-wide">
                          <AlertCircle className="h-4 w-4" /> Pembayaran Awal (DP)
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
                          Wajib dibayar untuk proses penjadwalan kunjungan teknisi.
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-destructive/15 bg-background/70 p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Nominal
                        </div>
                        <div className="mt-1 text-lg font-black text-primary leading-none">
                          {formatRupiah(dpAmount)}
                        </div>
                      </div>
                      <div className="rounded-lg border border-destructive/15 bg-background/70 p-3 flex flex-col justify-between">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Jenis
                        </div>
                        <div className="mt-2">
                          <Badge variant="secondary" className="h-6 px-3 text-xs font-bold">
                            DP
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <PaymentMethodChooser
                    orderId={orderIdShort}
                    amount={dpAmount}
                    title="Pembayaran Biaya Awal (DP)"
                    buttonText="Bayar Biaya Awal Sekarang"
                    buttonClassName="w-full h-12 text-sm font-bold shadow-md hover:scale-[1.02] transition-transform"
                  />
                </>
              )}

              {isInProgress && (
                <>
                  <div className="rounded-xl bg-primary/5 p-5 border border-primary/10 text-center space-y-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-7 w-7 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-primary">Pembayaran Awal Diterima</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        Tim kami sedang mengerjakan pesanan Anda. Kami akan memberitahu Anda jika servis telah selesai.
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 opacity-50">
                    <div className="flex justify-between text-xs italic">
                      <span>Status Pembayaran</span>
                      <span className="text-primary font-bold uppercase tracking-wider">Lunas Tahap Awal</span>
                    </div>
                  </div>
                </>
              )}

              {isFinalPayment && (
                <>
                  <div className="rounded-xl bg-destructive/5 p-4 border border-destructive/10">
                    <div className="flex items-center gap-2 text-destructive text-xs font-bold mb-1.5 uppercase tracking-wide">
                      <AlertCircle className="h-4 w-4" /> Pelunasan Sisa Biaya
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      Pengerjaan teknisi telah selesai. Silakan lakukan pelunasan untuk mengaktifkan masa garansi servis Anda.
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total Keseluruhan Biaya</span>
                      <span className="font-bold">{formatRupiah(service.biaya ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-primary bg-primary/5 p-2 rounded-lg border border-primary/10">
                      <span className="font-medium">Pembayaran Awal (DP)</span>
                      <span className="font-bold">-{formatRupiah(dpAmount)}</span>
                    </div>
                    <Separator className="bg-muted" />
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm font-bold text-foreground">Sisa Yang Harus Dibayar</span>
                      <span className="text-xl font-black text-primary">{formatRupiah(pelunasanAmount)}</span>
                    </div>
                  </div>
                  <PaymentMethodChooser
                    orderId={orderIdShort}
                    amount={pelunasanAmount}
                    title="Pembayaran Pelunasan"
                    buttonText="Bayar Pelunasan Sekarang"
                    buttonClassName="w-full h-12 text-sm font-bold shadow-md hover:scale-[1.02] transition-transform"
                  />
                </>
              )}

              {isCompleted && (
                <>
                  <div className="rounded-xl bg-green-500/5 p-5 border border-green-500/10 text-center space-y-3">
                    <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-7 w-7 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-green-600">Pesanan Selesai & Lunas</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        Terima kasih telah menggunakan layanan Tiamac. Pengerjaan ini kini dalam masa garansi 30 hari.
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Total Terbayar</span>
                      <span className="font-bold text-foreground">{formatRupiah(service.biaya ?? 0)}</span>
                    </div>
                    <Separator className="bg-muted" />
                    <Button
                      variant="outline"
                      className="w-full h-10 text-xs font-semibold gap-2 border-muted hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-4 w-4" /> Download Invoice (PDF)
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="rounded-xl border border-dashed border-muted p-5 flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold">Ada Kendala Pembayaran?</div>
              <div className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                Sistem kami menggunakan konfirmasi otomatis. Jika status belum berubah setelah bayar, silakan hubungi admin kami.
              </div>
              <Button variant="link" className="text-xs font-bold p-0 h-auto text-primary hover:no-underline mt-1">
                Hubungi Admin Tiamac
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
