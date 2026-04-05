'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Tag, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react"

interface ServiceDetailDialogProps {
  service: any
  children: React.ReactNode
}

export function ServiceDetailDialog({ service, children }: ServiceDetailDialogProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Rp 0"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[32px] border-0 shadow-2xl p-0 overflow-hidden bg-slate-50/50 backdrop-blur-xl">
        <DialogHeader className="p-8 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Detail Pekerjaan</DialogTitle>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Service ID: #{service.id.slice(0, 8)}</p>
            </div>
            <Badge variant="secondary" className="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 rounded-full border-0">
              {service.status_servis}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#66B21D]">
                <User className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Pelanggan</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">{service.customer?.name}</p>
                <p className="text-[11px] font-medium text-slate-400">{service.customer?.email}</p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-blue-500">
                <Calendar className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Waktu Selesai</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">{formatDate(service.updatedAt)}</p>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <Clock className="size-3" />
                  <span>Selesai pada sistem</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Tag className="size-4 text-slate-400" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Informasi Layanan</span>
            </div>
            <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm space-y-6">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-1.5 p-4 rounded-2xl bg-[#66B21D]/5 border border-[#66B21D]/10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Akhir Pengerjaan</p>
                  <div className="flex items-center gap-1.5 text-[#66B21D]">
                    <CheckCircle2 className="size-3.5" />
                    <p className="text-sm font-black uppercase tracking-tight">{service.status_servis}</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-50" />

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keluhan Pelanggan</p>
                <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 italic">
                  "{service.keluhan || 'Tidak ada keluhan tertulis'}"
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-6 rounded-[32px] bg-slate-900 text-white space-y-4 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <CreditCard className="size-24 -rotate-12" />
            </div>
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-60">
                  <CreditCard className="size-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Rincian Biaya</span>
                </div>
                <Badge className="bg-white/10 text-white border-0 text-[9px] font-black uppercase tracking-widest">PAID</Badge>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium opacity-50 uppercase tracking-wider">Total Biaya Servis</p>
                  <p className="text-3xl font-black tracking-tighter">{formatCurrency(service.biaya)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100">
           <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <AlertCircle className="size-5 text-amber-500 shrink-0" />
              <p className="text-xs font-bold text-amber-700 leading-relaxed">
                Pekerjaan ini telah diverifikasi dan diselesaikan. Riwayat ini bersifat permanen dan tidak dapat diubah kembali.
              </p>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
