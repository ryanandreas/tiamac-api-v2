"use client"

import { Tag, Clock, BadgePercent, PartyPopper, Snowflake, TicketPercent } from "lucide-react"
import Link from "next/link"

const promos = [
  {
    title: "Hemat Cuci AC",
    description: "Pemesanan minimal 3 unit AC sekaligus. Berlaku untuk semua tipe AC (0.5 - 2 PK).",
    discount: { prefix: "Diskon", value: "15%" },
    code: "CUCIHEMAT15",
    icon: BadgePercent,
    theme: {
      text: "text-[#66B21D]",
      bg: "bg-linear-to-b from-[#66B21D]/20 to-transparent",
      button: "bg-[#66B21D]",
      shadow: "shadow-[#66B21D]/20"
    }
  },
  {
    title: "Pelanggan Baru",
    description: "Promo spesial untuk transaksi pertama Anda di Tiam AC. Nikmati udara bersih lebih hemat.",
    discount: { prefix: "Potongan", value: "Rp 25rb" },
    code: "TIAMBARU25",
    icon: PartyPopper,
    theme: {
      text: "text-orange-600",
      bg: "bg-linear-to-b from-orange-200/50 to-transparent",
      button: "bg-orange-600",
      shadow: "shadow-orange-200/50"
    }
  },
  {
    title: "Paket Isi Freon",
    description: "Dapatkan paket spesial cuci AC + tambah freon (R32/R410A) with harga lebih terjangkau.",
    discount: { prefix: "Hemat", value: "Rp 50rb" },
    code: "FREONGAS",
    icon: Snowflake,
    theme: {
      text: "text-blue-600",
      bg: "bg-linear-to-b from-blue-200/50 to-transparent",
      button: "bg-blue-600",
      shadow: "shadow-blue-200/50"
    }
  }
]

export function LandingPromo() {
  return (
    <section id="promo" className="py-24 bg-linear-to-b from-white to-[#66B21D]/10 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 -z-10 w-96 h-96 bg-green-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 -z-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#66B21D]/10 text-[#66B21D] text-sm font-bold mb-6">
            <TicketPercent className="size-4" />
            Promo Terbatas
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight" id="promo-title">
            Penawaran Spesial Untuk Anda
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Nikmati layanan teknisi AC profesional dengan harga lebih hemat menggunakan kode promo di bawah ini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promos.map((promo, index) => (
            <div 
              key={index} 
              className={`group relative overflow-hidden ${promo.theme.bg} backdrop-blur-xl p-8 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02] flex flex-col`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className={`size-14 rounded-2xl bg-linear-to-b from-white/20 to-transparent flex items-center justify-center mb-6 ${promo.theme.text} group-hover:scale-110 transition-transform`}>
                  <promo.icon className="size-7" />
                </div>
                
                <h3 className={`text-2xl font-semibold mb-3 tracking-tight ${promo.theme.text}`}>{promo.title}</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed flex-grow">
                  {promo.description}
                </p>
                
                <div className={`mb-8 ${promo.theme.text}`}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-1 opacity-60">
                    {promo.discount.prefix}
                  </span>
                  <div className="text-4xl font-bold tracking-tight">
                    {promo.discount.value}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">Kode Promo</span>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${promo.theme.bg} ${promo.theme.text} text-[10px] font-bold`}>
                      <Clock className="size-3" />
                      Berlaku s/d Akhir Bulan
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-3 bg-slate-50 border-0 rounded-xl font-bold text-slate-700 tracking-widest flex-1 text-center font-mono">
                      {promo.code}
                    </div>
                    <Link 
                      href="/booking" 
                      className={`size-12 rounded-xl ${promo.theme.button} flex items-center justify-center text-white transition-all active:scale-95 hover:scale-105 shadow-sm`}
                    >
                      <Tag className="size-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
            <p className="text-slate-500 font-medium text-sm mb-2">Punya pertanyaan tentang promo?</p>
            <Link 
              href="https://wa.me/628123456789" 
              className="text-[#66B21D] font-bold hover:underline"
              target="_blank"
            >
              Hubungi CS via WhatsApp
            </Link>
        </div>
      </div>
    </section>
  )
}
