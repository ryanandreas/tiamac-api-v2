"use client"

import { Droplets, Hammer, Boxes, ThermometerSnowflake, ArrowRight } from "lucide-react"
import Link from "next/link"

const services = [
  {
    title: "Cuci AC (Maintenance)",
    description: "Pembersihan rutin untuk menjaga udara tetap bersih dan AC bekerja efisien.",
    icon: Droplets,
    price: "Mulai Rp 75rb",
    color: "bg-linear-to-b from-[#66B21D]/20 to-transparent text-[#66B21D]",
  },
  {
    title: "Perbaikan AC",
    description: "Solusi untuk AC tidak dingin, berisik, bocor, atau mati total.",
    icon: Hammer,
    price: "Mulai Rp 150rb",
    color: "bg-linear-to-b from-[#66B21D]/20 to-transparent text-[#66B21D]",
  },
  {
    title: "Bongkar Pasang",
    description: "Pindahan atau pasang unit AC baru dengan instalasi profesional.",
    icon: Boxes,
    price: "Mulai Rp 250rb",
    color: "bg-linear-to-b from-[#66B21D]/20 to-transparent text-[#66B21D]",
  },
  {
    title: "Tambah / Isi Freon",
    description: "Pengisian freon R22, R32, atau R410A untuk performa pendinginan maksimal.",
    icon: ThermometerSnowflake,
    price: "Mulai Rp 100rb",
    color: "bg-linear-to-b from-[#66B21D]/20 to-transparent text-[#66B21D]",
  },
]

export function LandingServices() {
  return (
    <section id="layanan" className="py-24 bg-linear-to-b from-[#66B21D]/10 to-white">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Layanan Populer Kami
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Kami menyediakan berbagai solusi untuk kenyamanan udara di ruangan Anda. Dapatkan servis terbaik dari teknisi ahli kami.
          </p>
          {/* 
          <Link 
            href="/services" 
            className="group inline-flex items-center gap-2 text-[#66B21D] font-extrabold hover:text-[#4d9e0f] transition-colors"
          >
            Lihat Semua Layanan
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group relative overflow-hidden bg-linear-to-b from-[#66B21D]/15 to-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] transition-all duration-500 hover:from-[#66B21D]/25 hover:to-white/10 flex flex-col"
            >
              {/* Particle Elements */}
              <div className="absolute -top-10 -right-10 size-32 bg-[#66B21D]/10 rounded-full blur-3xl group-hover:bg-[#66B21D]/20 transition-colors duration-500" />
              <div className="absolute -bottom-10 -left-10 size-24 bg-[#66B21D]/5 rounded-full blur-2xl group-hover:bg-[#66B21D]/10 transition-colors duration-500" />

              <div className="relative z-10 flex flex-col h-full">
                <div className={`size-14 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <service.icon className="size-7" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 tracking-tight">{service.title}</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed flex-1">
                  {service.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100/50 mt-auto">
                  <span className="text-sm font-bold text-[#66B21D]">{service.price}</span>
                  <Link 
                    href="/booking" 
                    className="size-10 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#66B21D] group-hover:text-white transition-all hover:scale-110 active:scale-95"
                  >
                    <ArrowRight className="size-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
