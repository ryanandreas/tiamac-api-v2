"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Package, ShieldCheck, CreditCard, X, Eye } from "lucide-react"

export interface OrderUnit {
  id: string
  name: string
  pk: string
  serviceName: string
  price: number
}

interface OrderDetailDialogProps {
  orderId: string
  units: OrderUnit[]
  biayaDasar: number
  totalBiaya: number
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function OrderDetailDialog({
  orderId,
  units,
  biayaDasar,
  totalBiaya,
  trigger,
  open,
  onOpenChange
}: OrderDetailDialogProps) {
  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : open === undefined ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 border-slate-200 hover:border-[#66B21D] hover:text-[#66B21D] transition-all">
            <Eye className="h-4 w-4" /> Lihat Detail Pesanan
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Detail Rincian Pesanan</DialogTitle>
              <DialogDescription className="text-xs font-black text-[#66B21D] uppercase tracking-widest">
                Order ID: #{orderId.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </div>
            {/* The Close button is provided by DialogContent, but we can add a custom dismiss button in footer or use the default X */}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Unit Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="size-6 rounded-lg bg-green-50 flex items-center justify-center text-[#66B21D]">
                    <Package className="h-3.5 w-3.5" />
                </div>
                Unit AC & Layanan
              </div>

              <div className="grid gap-4">
                {units.map((unit, index) => (
                  <div key={unit.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4 group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black group-hover:bg-[#66B21D] transition-colors">
                            {String(index + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{unit.name}</h4>
                          <p className="text-[11px] font-bold text-slate-400">Kapasitas: {unit.pk} PK</p>
                        </div>
                      </div>
                      <div className="text-sm font-black text-slate-900 tracking-tight">
                        {formatRupiah(unit.price)}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-100 border-l-4 border-l-[#66B21D]">
                        <p className="text-[11px] font-bold text-slate-600">
                             <span className="text-slate-400 font-black uppercase tracking-tighter mr-2">Layanan:</span>
                             {unit.serviceName}
                        </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="size-6 rounded-lg bg-green-50 flex items-center justify-center text-[#66B21D]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    Ringkasan Biaya
                </div>
                <div className="space-y-3 px-1">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-400">Total Biaya Jasa ({units.length} Unit)</span>
                        <span className="text-sm font-black text-slate-900">{formatRupiah(totalBiaya - biayaDasar)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-400">Biaya Kunjungan & Transport</span>
                        <span className="text-sm font-black text-slate-900">{formatRupiah(biayaDasar)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-400">Pajak & Layanan (0%)</span>
                        <span className="text-sm font-black text-slate-900">{formatRupiah(0)}</span>
                    </div>
                    <div className="h-px bg-slate-100 my-4" />
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-900 tracking-tight">Total Akhir</span>
                        <span className="text-xl font-black text-[#66B21D] tracking-tight">{formatRupiah(totalBiaya)}</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-top border-slate-100 bg-slate-50 flex justify-end">
             <DialogTrigger asChild>
                <Button className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all">
                    Tutup Detail
                </Button>
             </DialogTrigger>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
