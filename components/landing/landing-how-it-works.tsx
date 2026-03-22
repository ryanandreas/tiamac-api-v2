"use client"

import { MousePointer2, MessageSquareMore, Truck, Sparkles } from "lucide-react"

const steps = [
  {
    title: "Pesan Online",
    description: "Pilih layanan dan tentukan jadwal yang sesuai melalui website.",
    icon: MousePointer2,
    color: "text-blue-600 bg-blue-100/50",
  },
  {
    title: "Konfirmasi",
    description: "Tim kami akan melakukan konfirmasi instan via WhatsApp.",
    icon: MessageSquareMore,
    color: "text-orange-600 bg-orange-100/50",
  },
  {
    title: "Teknisi Datang",
    description: "Teknisi profesional tiba di lokasi tepat waktu sesuai jadwal.",
    icon: Truck,
    color: "text-purple-600 bg-purple-100/50",
  },
  {
    title: "Servis Selesai",
    description: "Pengecekan akhir dan garansi servis selama 30 hari.",
    icon: Sparkles,
    color: "text-green-600 bg-green-100/50",
  },
]

export function LandingHowItWorks() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Cara Kerja <span className="text-[#66B21D]">Tiam AC</span>
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Proses pemesanan yang mudah, cepat, dan transparan mulai dari awal hingga selesai.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">


          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className={`size-24 rounded-[2.5rem] ${step.color} flex items-center justify-center mb-8 group-hover:bg-white group-hover:scale-110 transition-all duration-500 relative`}>
                <div className="absolute -top-2 -right-2 size-8 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xs font-black">
                    {index + 1}
                </div>
                <step.icon className="size-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{step.title}</h3>
              <p className="text-slate-500 text-sm font-bold leading-relaxed max-w-[200px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-white">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="size-10 rounded-full bg-slate-200 overflow-hidden">
                             <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
                <p className="text-sm font-bold text-slate-600">
                    Bergabung dengan <span className="text-slate-900 font-black">2,000+</span> pelanggan puas lainnya
                </p>
            </div>
        </div>
      </div>
    </section>
  )
}
