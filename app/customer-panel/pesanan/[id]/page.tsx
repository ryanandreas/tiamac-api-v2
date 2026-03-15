"use server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  MapPin,
  Package,
  Smartphone,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PaymentMethodChooser } from "@/components/payment-method-chooser"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { OrderDetailDialog, OrderUnit } from "@/components/dashboard/order-detail-dialog"
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
  const firstEmptyLineIdx = keluhanLines.findIndex((line) => line.trim() === "")
  // const keluhanMain =
  //   firstEmptyLineIdx >= 0 ? keluhanLines.slice(0, firstEmptyLineIdx).join("\n").trim() : keluhanText.trim()

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
  const totalFinal = service.biaya ?? totalEstimasi

  // Map units for the Detail Dialog
  const orderUnits: OrderUnit[] = service.acUnits.map((unit) => ({
    id: unit.id,
    name: `Unit AC ${unit.pk} PK`,
    pk: String(unit.pk),
    serviceName: unit.layanan.map(l => l.nama).join(", ") || "Servis Routine",
    price: unit.layanan.reduce((sum, l) => sum + l.harga, 0)
  }))

  const isFinalPayment = ["Pekerjaan Selesai", "Menunggu Pembayaran"].includes(service.status_servis)
  const isCompleted = ["Selesai", "Selesai (Garansi Aktif)"].includes(service.status_servis)
  const isPendingInitial = service.status_servis === "Booking"

  const dpAmount = biayaKunjungan
  const pelunasanAmount = Math.max(0, (service.biaya ?? 0) - biayaKunjungan)
  const amountToPay = isPendingInitial ? dpAmount : pelunasanAmount

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Pembayaran Pesanan</h1>
            <Badge className={cn(
              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
              isPendingInitial || isFinalPayment 
                ? "bg-orange-50 text-orange-600 hover:bg-orange-100" 
                : "bg-green-50 text-green-600 hover:bg-green-100"
            )}>
              {service.status_servis}
            </Badge>
          </div>
        </div>

        <DynamicBreadcrumbs />
        
        <p className="text-sm font-bold text-slate-400 mt-2 max-w-2xl">
          Silakan selesaikan pembayaran untuk mengonfirmasi pesanan Anda agar teknisi kami dapat segera meluncur ke lokasi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 relative items-start">
        {/* Left Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Order Summary Card */}
          <Card className="rounded-[32px] border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white group py-0 gap-0">
            <div className="p-8 pt-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6 group-hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Pesanan</span>
                <p className="text-lg font-black text-slate-900">#{orderIdShort}</p>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-right space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Pesanan</span>
                  <p className="text-sm font-black text-slate-900">
                    {new Date(service.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                </div>

                <OrderDetailDialog 
                  orderId={service.id}
                  units={orderUnits}
                  biayaDasar={biayaKunjungan}
                  totalBiaya={totalFinal}
                />
              </div>
            </div>

            <CardContent className="p-8 space-y-8">
              {/* Main Service Icon & Name */}
              <div className="flex items-center gap-5 p-6 rounded-3xl bg-slate-50 border border-slate-100 group/item">
                <div className="size-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/10 group-hover/item:bg-[#66B21D] transition-all">
                  <Package className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">Servis AC Routine (Cleaning)</h4>
                  <p className="text-xs font-bold text-slate-400">Layanan perawatan berkala untuk {service.acUnits.length} unit AC</p>
                </div>
              </div>

              {/* Items Placeholder Breakdown */}
              <div className="space-y-4 px-2">
                <div className="flex justify-between items-center group/line">
                   <span className="text-sm font-bold text-slate-500 group-hover/line:text-slate-900 transition-colors">Cuci AC Routine ({service.acUnits.length} Unit)</span>
                   <span className="text-sm font-black text-slate-900">{formatRupiah(layananTotal)}</span>
                </div>
                <div className="flex justify-between items-center group/line">
                   <span className="text-sm font-bold text-slate-500 group-hover/line:text-slate-900 transition-colors">Biaya Kunjungan & Transport</span>
                   <span className="text-sm font-black text-slate-900">{formatRupiah(biayaKunjungan)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Contact Section */}
          <Card className="rounded-[32px] border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden bg-white py-0 gap-0">
            <CardHeader className="p-8 pt-8 pb-0">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-[#66B21D]">
                    <MapPin className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-black text-slate-900 tracking-tight">Informasi Lokasi & Kontak</h3>
              </div>
            </CardHeader>
            <CardContent className="p-8 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Alamat Pengerjaan</span>
                  <p className="text-sm font-black text-slate-600 leading-relaxed">
                    {alamatText || "Alamat belum lengkap"}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kontak Pelanggan</span>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 w-fit">
                    <div className="size-11 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#66B21D] shadow-sm">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-sm font-black text-slate-900">{phoneText}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{service.customer?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Sticky Payment Card */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
          {/* Payment Method Selector */}
          <Card className="rounded-[32px] border-slate-100 shadow-xl shadow-slate-200/50 bg-white p-8 pt-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Metode Pembayaran</h3>
            
            <PaymentMethodChooser
              orderId={orderIdShort}
              amount={amountToPay}
              title={isPendingInitial ? "Pembayaran Biaya Awal (DP)" : "Pembayaran Pelunasan"}
              buttonText="Bayar Sekarang"
              buttonClassName="hidden" 
              triggerId="custom-pay-button"
            />
          </Card>

          {/* Total Summary Card */}
          <PaymentSummaryCard 
            amount={amountToPay}
            label={isPendingInitial ? "Biaya Kunjungan (DP)" : "Pelunasan Pesanan"}
            isCompleted={isCompleted}
            triggerId="custom-pay-button"
          />
        </div>
      </div>
    </div>
  )
}
