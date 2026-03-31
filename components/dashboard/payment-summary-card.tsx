"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, ShieldCheck, ArrowRight, Wallet } from "lucide-react"
import Link from "next/link"

interface PaymentSummaryCardProps {
  amount: number
  label?: string
  isCompleted: boolean
  triggerId: string
  variant?: "vertical" | "horizontal"
}

export function PaymentSummaryCard({
  amount,
  label,
  isCompleted,
  triggerId,
  variant = "vertical"
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

  if (variant === "horizontal") {
    return (
      <div className="rounded-3xl bg-slate-900 border-none shadow-none p-5 md:p-6 overflow-hidden relative group transition-all hover:bg-slate-800/90">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#66B21D] rounded-full blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 relative z-10 w-full">
          {/* Leftside: Icon + Meta */}
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#66B21D] shrink-0">
               <Wallet className="size-7" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 tracking-wide">{label || "Total Tagihan"}</span>
              <h2 className="text-3xl font-bold text-white tracking-tighter">{formatRupiah(amount)}</h2>
            </div>
          </div>

          {/* Center: Security Specs */}
          <div className="hidden lg:flex items-center gap-6 border-x border-white/5 px-8">
            <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-[#66B21D]" />
              Bebas Biaya Admin
            </div>
            <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-400">
              <ShieldCheck className="h-4 w-4 text-[#66B21D]" />
              Sistem Pembayaran Aman
            </div>
          </div>

          {/* Rightside: Action */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="md:hidden flex flex-col gap-1">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <CheckCircle2 className="h-3 w-3 text-[#66B21D]" /> Admin Gratis
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <ShieldCheck className="h-3 w-3 text-[#66B21D]" /> Aman 100%
               </div>
            </div>

            {isCompleted ? (
              <div className="px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                 <p className="text-xs font-bold text-green-500">Lunas & Selesai</p>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <Button 
                  onClick={handlePayClick}
                  className="h-12 px-8 rounded-xl bg-[#66B21D] hover:bg-[#5aa018] text-white font-bold text-xs shadow-none transition-all gap-2 group/btn"
                >
                  Bayar Sekarang <ArrowRight className="size-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                <div className="hidden md:block text-[9px] font-bold text-slate-500 px-1">
                  Ada Kendala? <Link href="#" className="text-[#66B21D] hover:underline">Hubungi Customer Service</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-slate-900 border-none shadow-none p-8 overflow-hidden relative group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#66B21D] rounded-full blur-[80px] opacity-10 -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity"></div>
      
      <div className="space-y-6 relative z-10">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">{label || "Total Tagihan"}</span>
          <h2 className="text-4xl font-bold text-white tracking-tighter">{formatRupiah(amount)}</h2>
        </div>

        <div className="h-px bg-slate-800" />

        <div className="space-y-3">
           <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-[#66B21D]" />
              Bebas Biaya Admin
           </div>
           <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
              <ShieldCheck className="h-4 w-4 text-[#66B21D]" />
              Jaminan Transaksi Aman
           </div>
        </div>

        {isCompleted ? (
          <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
             <p className="text-sm font-bold text-green-500">Lunas & Selesai</p>
          </div>
        ) : (
          <Button 
            onClick={handlePayClick}
            className="w-full h-14 rounded-2xl bg-[#66B21D] hover:bg-[#5aa018] text-white font-bold text-sm shadow-none transition-all"
          >
            Bayar Pesanan
          </Button>
        )}

        <div className="pt-2 text-center border-t border-slate-800 mt-4">
           <p className="text-[10px] font-semibold text-slate-500">
              Ada Kendala? Hubungi <Link href="#" className="text-[#66B21D] hover:underline transition-all">Customer Care</Link>
           </p>
        </div>
      </div>
    </div>
  )
}
