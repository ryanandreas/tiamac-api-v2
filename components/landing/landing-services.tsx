"use client"

import { Snowflake, Wrench, ArrowRight, Thermometer, Box } from "lucide-react"
import Link from "next/link"

const services = [
  {
    title: "Cuci AC (Maintenance)",
    description: "Pembersihan rutin untuk menjaga udara tetap bersih dan AC bekerja efisien.",
    icon: Snowflake,
    price: "Mulai Rp 75rb",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Perbaikan AC",
    description: "Solusi untuk AC tidak dingin, berisik, bocor, atau mati total.",
    icon: Wrench,
    price: "Mulai Rp 150rb",
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Bongkar Pasang",
    description: "Pindahan atau pasang unit AC baru dengan instalasi profesional.",
    icon: Box,
    price: "Mulai Rp 250rb",
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Tambah / Isi Freon",
    description: "Pengisian freon R22, R32, atau R410A untuk performa pendinginan maksimal.",
    icon: Thermometer,
    price: "Mulai Rp 100rb",
    color: "bg-green-50 text-[#66B21D]",
  },
]

export function LandingServices() {
  return (
    <section id="layanan" className="py-24 bg-[#fcfdfa]">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              Layanan <span className="text-[#66B21D]">Populer Kami</span>
            </h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Kami menyediakan berbagai solusi untuk kenyamanan udara di ruangan Anda. Dapatkan servis terbaik dari teknisi ahli kami.
            </p>
          </div>
          <Link 
            href="/services" 
            className="group inline-flex items-center gap-2 text-[#66B21D] font-extrabold hover:text-[#4d9e0f] transition-colors"
          >
            Lihat Semua Layanan
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`size-14 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <service.icon className="size-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{service.title}</h3>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                {service.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-sm font-black text-[#66B21D]">{service.price}</span>
                <Link 
                  href="/booking" 
                  className="size-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#66B21D] group-hover:text-white transition-all"
                >
                  <ArrowRight className="size-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
