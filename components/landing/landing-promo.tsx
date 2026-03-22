"use client"

import { Tag, Sparkles, Clock, TicketPercent } from "lucide-react"
import Link from "next/link"

const promos = [
  {
    title: "Hemat Cuci AC",
    description: "Pemesanan minimal 3 unit AC sekaligus. Berlaku untuk semua tipe AC (0.5 - 2 PK).",
    discount: "Diskon 15%",
    code: "CUCIHEMAT15",
    color: "from-blue-600 to-cyan-500",
    icon: Sparkles
  },
  {
    title: "Pelanggan Baru",
    description: "Promo spesial untuk transaksi pertama Anda di Tiam AC. Nikmati udara bersih lebih hemat.",
    discount: "Potongan Rp 25rb",
    code: "TIAMBARU25",
    color: "from-[#66B21D] to-green-500",
    icon: Tag
  },
  {
    title: "Paket Isi Freon",
    description: "Dapatkan paket spesial cuci AC + tambah freon (R32/R410A) dengan harga lebih terjangkau.",
    discount: "Hemat Rp 50rb",
    code: "FREONGAS",
    color: "from-orange-600 to-yellow-500",
    icon: TicketPercent
  }
]

export function LandingPromo() {
  return (
    <section id="promo" className="py-24 bg-slate-100/50 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 -z-10 w-96 h-96 bg-green-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 -z-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#66B21D]/10 text-[#66B21D] text-sm font-bold mb-6">
            <TicketPercent className="size-4" />
            Promo Terbatas
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Penawaran <span className="text-[#66B21D]">Spesial Untuk Anda</span>
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Nikmati layanan teknisi AC profesional dengan harga lebih hemat menggunakan kode promo di bawah ini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promos.map((promo, index) => (
            <div 
              key={index} 
              className="group relative bg-white p-1 shadow-none rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="p-8 h-full flex flex-col">
                <div className={`size-14 rounded-2xl bg-linear-to-br ${promo.color} flex items-center justify-center mb-6 text-white`}>
                  <promo.icon className="size-7" />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{promo.title}</h3>
                <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed flex-grow">
                  {promo.description}
                </p>
                
                <div className={`text-2xl font-black mb-6 bg-linear-to-r ${promo.color} bg-clip-text text-transparent`}>
                  {promo.discount}
                </div>

                <div className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Kode Promo</span>
                    <div className="flex items-center gap-1 text-[10px] font-black text-[#66B21D]">
                      <Clock className="size-3" />
                      Berlaku s/d Akhir Bulan
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-3 bg-slate-50 border-0 rounded-xl font-black text-slate-700 tracking-widest flex-1 text-center font-mono">
                      {promo.code}
                    </div>
                    <Link 
                      href="/booking" 
                      className={`size-12 rounded-xl bg-linear-to-br ${promo.color} flex items-center justify-center text-white transition-all active:scale-95`}
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
              className="text-[#66B21D] font-black hover:underline"
              target="_blank"
            >
              Hubungi CS via WhatsApp
            </Link>
        </div>
      </div>
    </section>
  )
}
