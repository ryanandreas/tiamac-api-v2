"use server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  MapPin,
  Package,
  Smartphone,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  CreditCard
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PaymentMethodChooser } from "@/components/payment-method-chooser"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { ServiceStatusHistoryDialog } from "@/components/dashboard/service-status-history-dialog"
import { PaymentSummaryCard } from "@/components/dashboard/payment-summary-card"

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
  
  const alamatLine = keluhanLines.find((line) => line.startsWith("Alamat:"))
  const alamat = alamatLine ? alamatLine.replace(/^Alamat:\s*/, "").trim() : undefined

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
  const totalFinal = service.biaya ?? service.estimasi_biaya ?? totalEstimasi

  const isFinalPayment = ["Perbaikan Unit", "Pekerjaan Selesai", "Menunggu Pembayaran"].includes(service.status_servis)
  const isCompleted = ["Selesai", "Selesai (Garansi Aktif)"].includes(service.status_servis)
  const isPendingInitial = service.status_servis === "Booking"

  const dpAmount = biayaKunjungan
  const pelunasanAmount = Math.max(0, totalFinal - biayaKunjungan)
  const amountToPay = isPendingInitial ? dpAmount : pelunasanAmount

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Section */}
      <div className="bg-white px-6 py-4 rounded-3xl space-y-3 border-none shadow-none">
        <div className="flex items-center gap-3">
           <Link href="/customer-panel/pesanan">
             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
                <ArrowLeft className="h-4 w-4" />
             </Button>
           </Link>
           <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Detail Pesanan</h1>
           <Badge className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold border-none shadow-none",
                  isPendingInitial || isFinalPayment 
                    ? "bg-orange-50 text-orange-600" 
                    : "bg-green-50 text-[#66B21D]"
                )}>
                  {service.status_servis}
            </Badge>
        </div>
        <div className="flex flex-col gap-1 pl-1">
          <DynamicBreadcrumbs />
          <p className="text-slate-500 font-medium text-sm mt-1">Selesaikan administrasi Anda untuk mempercepat proses pengerjaan unit.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">
        {/* Left Content */}
        <div className="lg:col-span-8 space-y-4">
          {/* Order Summary Card */}
          <Card className="rounded-3xl border-none shadow-none overflow-hidden bg-white !py-0 gap-0">
            <CardHeader className="px-6 pt-5 pb-5 border-b border-slate-50 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400">Nomor Pesanan</span>
                <p className="text-lg font-bold text-slate-900 leading-none">#{orderIdShort}</p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400">Tanggal Pesanan</span>
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    {new Date(service.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                </div>

                <ServiceStatusHistoryDialog 
                  serviceId={service.id}
                  trigger={
                    <Button variant="outline" className="h-9 rounded-xl font-bold text-xs gap-2 border-slate-200">
                      <CreditCard className="size-3.5" /> Melihat Detail Servis
                    </Button>
                  }
                />
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Main Service Info Row */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 group/item">
                <div className="size-12 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover/item:bg-[#66B21D] transition-all">
                  <Package className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-base font-bold text-slate-900">Routine Cleaning</h4>
                  <p className="text-xs font-medium text-slate-400">Layanan perawatan berkala untuk {service.acUnits.length} unit favorit Anda.</p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-3 px-1">
                <div className="flex justify-between items-center group/line">
                   <div className="flex items-center gap-3">
                      <div className="size-1.5 rounded-full bg-slate-200 group-hover/line:bg-[#66B21D] transition-colors" />
                      <span className="text-sm font-medium text-slate-500 group-hover/line:text-slate-900 transition-colors">Routine Cleaning ({service.acUnits.length} Unit)</span>
                   </div>
                   <span className="text-sm font-bold text-slate-900">{formatRupiah(layananTotal)}</span>
                </div>
                <div className="flex justify-between items-center group/line">
                   <div className="flex items-center gap-3">
                      <div className="size-1.5 rounded-full bg-slate-200 group-hover/line:bg-[#66B21D] transition-colors" />
                      <span className="text-sm font-medium text-slate-500 group-hover/line:text-slate-900 transition-colors">Biaya Kunjungan & Diagnosa</span>
                   </div>
                   <span className="text-sm font-bold text-slate-900">{formatRupiah(biayaKunjungan)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Contact Section */}
          <Card className="rounded-3xl border-none shadow-none overflow-hidden bg-white py-0 gap-0">
            <CardHeader className="px-6 pt-5 pb-2">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-[#66B21D]">
                    <MapPin className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 tracking-tight">Lokasi & Kontak Pengerjaan</h3>
              </div>
            </CardHeader>
            <CardContent className="px-6 pt-0 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 block px-1">Alamat Lengkap</span>
                  <div className="p-4 rounded-2xl bg-slate-50/50 border-none font-medium text-sm text-slate-600 leading-relaxed">
                    {alamatText || "Alamat belum lengkap atau tidak ditemukan."}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 block px-1">Informasi Pelanggan</span>
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50 border-none w-full">
                    <div className="size-11 rounded-xl bg-white border-none flex items-center justify-center text-[#66B21D] shadow-sm">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-sm font-bold text-slate-900">{phoneText}</p>
                       <p className="text-[10px] font-semibold text-slate-400">{service.customer?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-3xl p-6 pt-5 space-y-4">
             <div className="space-y-0.5 mb-2">
               <h3 className="text-lg font-bold text-slate-900 tracking-tight">Metode Pembayaran</h3>
               <p className="text-xs font-medium text-slate-400">Pilih kanal pembayaran praktis Anda.</p>
             </div>
             
             <PaymentMethodChooser
               orderId={service.id}
               amount={amountToPay}
               title={isPendingInitial ? "Biaya Awal (DP)" : "Pelunasan Hasil Servis"}
               buttonText="Bayar Sekarang"
               buttonClassName="hidden" 
               triggerId="custom-pay-button"
             />
          </div>
        </div>

        {/* Right Sidebar - Sticky Payment Summary */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <PaymentSummaryCard 
            amount={amountToPay}
            label={isPendingInitial ? "Biaya Kunjungan (DP)" : "Pelunasan Pesanan"}
            isCompleted={isCompleted}
            triggerId="custom-pay-button"
            variant="vertical"
          />
        </div>
      </div>
    </div>
  )
}
