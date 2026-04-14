"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Receipt, 
  CheckCircle2, 
  CreditCard, 
  Calendar, 
  Hash, 
  ChevronRight, 
  Building2,
  Wallet,
  Clock
} from "lucide-react"

interface PaymentDetailDialogProps {
  trigger?: React.ReactNode
  service: {
    id: string
    updatedAt: Date
    biaya: number | null
    status_servis: string
    acUnits: Array<{
      pk: string
      layanan: Array<{
        nama: string
        harga: number
      }>
    }>
    payments: Array<{
      id: string
      type: string
      amount: number
      metodePembayaran: string | null
      bank: string | null
      vaNumber: string | null
      waktuPembayaran: Date | null
      status: string
    }>
  }
}

export function PaymentDetailDialog({ trigger, service }: PaymentDetailDialogProps) {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const orderIdShort = service.id.slice(0, 8).toUpperCase()
  
  // Group services by name for summary if needed, or just list
  const totalPaid = service.payments
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-green-50 text-slate-400 hover:text-[#66B21D] transition-all">
            <Receipt className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl bg-[#F8FAFC]">
        <div className="bg-white p-6 pb-4 border-b border-slate-100 relative">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12 -z-10">
            <Receipt className="size-24" />
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-2xl bg-green-50 text-[#66B21D] flex items-center justify-center">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Detail Pembayaran</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Transaksi Terverifikasi</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="size-3 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</span>
              </div>
              <p className="text-sm font-black text-slate-900">#{orderIdShort}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="size-3 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu</span>
              </div>
              <p className="text-sm font-black text-slate-900">{formatDate(service.updatedAt).split(',')[0]}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Service Summary */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="size-3" /> Rincian Pekerjaan
            </h4>
            <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
              {service.acUnits.map((unit, idx) => (
                <div key={idx} className="p-3.5 flex items-start justify-between group">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[#66B21D]" />
                      Unit AC {idx + 1} ({unit.pk} PK)
                    </p>
                    <div className="mt-1 ml-3.5 flex flex-wrap gap-1">
                      {unit.layanan.map((l, lIdx) => (
                        <span key={lIdx} className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                          {l.nama}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-[11px] font-black text-slate-900 whitespace-nowrap ml-4">
                    {formatRupiah(unit.layanan.reduce((s, l) => s + l.harga, 0))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Wallet className="size-3" /> Riwayat Pembayaran
            </h4>
            <div className="space-y-2">
              {service.payments.map((payment) => {
                // Map raw payment types to user-friendly labels
                const getMethodLabel = () => {
                  const type = payment.metodePembayaran?.toLowerCase() || ""
                  if (type === "bank_transfer") return "Virtual Account"
                  if (type === "echannel") return "Mandiri Bill"
                  if (type === "cstore") return "Gerai Retail"
                  if (type === "qris") return "QRIS"
                  if (type === "gopay") return "GoPay"
                  if (type === "shopeepay") return "ShopeePay"
                  return (payment.metodePembayaran || "TRANSFER").toUpperCase()
                }

                const getProviderLabel = () => {
                  const bank = payment.bank?.toLowerCase() || ""
                  if (bank === "indomaret") return "Indomaret"
                  if (bank === "alfamart") return "Alfamart"
                  return (payment.bank || "").toUpperCase()
                }

                return (
                  <div key={payment.id} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-xl flex items-center justify-center ${payment.type === 'DOWN_PAYMENT' ? 'bg-blue-50 text-blue-500' : 'bg-[#66B21D]/10 text-[#66B21D]'}`}>
                          {payment.type === 'DOWN_PAYMENT' ? <Clock className="size-5" /> : <CheckCircle2 className="size-5" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{payment.type === 'DOWN_PAYMENT' ? 'Down Payment (DP)' : 'Pelunasan (Full)'}</p>
                          <p className="text-sm font-black text-slate-900 mt-0.5">
                            {getMethodLabel()} {getProviderLabel() ? `- ${getProviderLabel()}` : ""}
                          </p>
                          {payment.vaNumber && (
                            <p className="text-[10px] font-bold text-[#66B21D] mt-0.5 opacity-80">
                              No: {payment.vaNumber}
                            </p>
                          )}
                          {payment.waktuPembayaran && (
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                              <Clock className="size-2.5" />
                              {formatDate(payment.waktuPembayaran)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{formatRupiah(payment.amount)}</p>
                        <Badge className="text-[8px] h-4 bg-green-50 text-[#66B21D] border-none font-black uppercase mt-1">Lunas</Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Final Total */}
          <div className="bg-[#0F172A] rounded-2xl p-5 flex items-center justify-between shadow-xl shadow-slate-200">
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Dibayarkan</p>
                <p className="text-sm font-bold text-white/60">Semua Tagihan Selesai</p>
             </div>
             <div className="text-2xl font-black text-white tracking-tight">
               {formatRupiah(totalPaid)}
             </div>
          </div>

          <DialogHeader className="sr-only">
            <DialogTitle>Detail Pembayaran #{orderIdShort}</DialogTitle>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  )
}
