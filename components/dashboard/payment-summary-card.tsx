"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface PaymentSummaryCardProps {
  amount: number
  label?: string
  isCompleted: boolean
  triggerId: string
}

export function PaymentSummaryCard({
  amount,
  label,
  isCompleted,
  triggerId,
}: PaymentSummaryCardProps) {
  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)

  const handlePayClick = () => {
    const trigger = document.getElementById(triggerId)
    if (trigger) {
      trigger.click()
    }
  }

  return (
    <div className="rounded-[32px] bg-slate-900 border-none shadow-2xl shadow-slate-900/20 p-8 overflow-hidden relative group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#66B21D] rounded-full blur-[80px] opacity-10 -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity"></div>
      
      <div className="space-y-8 relative z-10">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label || "Total Pembayaran"}</span>
          <h2 className="text-4xl font-black text-white tracking-tighter">{formatRupiah(amount)}</h2>
        </div>

        <div className="h-px bg-slate-800" />

        <div className="space-y-3">
           <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-[#66B21D]" />
              Tanpa biaya admin tambahan
           </div>
           <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-[#66B21D]" />
              Proteksi pembayaran sistem aman
           </div>
        </div>

        {isCompleted ? (
          <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
             <p className="text-sm font-black text-green-500 uppercase tracking-widest">Pesanan Selesai & Lunas</p>
          </div>
        ) : (
          <Button 
            onClick={handlePayClick}
            className="w-full h-16 rounded-2xl bg-[#66B21D] hover:bg-[#5aa018] text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-[#66B21D]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Bayar Sekarang
          </Button>
        )}

        <div className="pt-2 text-center">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
              Ada Kendala? Hubungi <Link href="#" className="text-[#66B21D] hover:underline">Customer Service</Link>
           </p>
        </div>
      </div>
    </div>
  )
}
