"use client"

import { CheckCircle2, UserCircle, Clock, ShieldCheck } from "lucide-react"

const steps = [
  {
    title: "Pesan Online",
    description: "Pilih layanan dan tentukan jadwal yang sesuai melalui website.",
    icon: CheckCircle2,
    color: "text-blue-500 bg-blue-50",
  },
  {
    title: "Konfirmasi",
    description: "Tim kami akan melakukan konfirmasi instan via WhatsApp.",
    icon: UserCircle,
    color: "text-orange-500 bg-orange-50",
  },
  {
    title: "Teknisi Datang",
    description: "Teknisi profesional tiba di lokasi tepat waktu sesuai jadwal.",
    icon: Clock,
    color: "text-purple-500 bg-purple-50",
  },
  {
    title: "Servis Selesai",
    description: "Pengecekan akhir dan garansi servis selama 30 hari.",
    icon: ShieldCheck,
    color: "text-green-500 bg-green-50",
  },
]

export function LandingHowItWorks() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -z-10 w-full h-[300px] bg-green-50/30 -skew-y-3 translate-y-[-50%]"></div>
      
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
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[68px] left-[15%] right-[15%] h-1 border-t-2 border-dashed border-slate-100 -z-10"></div>

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className={`size-20 rounded-[2rem] ${step.color} flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50 group-hover:scale-110 transition-transform duration-500 relative bg-white`}>
                <div className="absolute -top-3 -right-3 size-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black italic">
                    0{index + 1}
                </div>
                <step.icon className={`size-10 ${step.color.split(' ')[0]}`} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{step.title}</h3>
              <p className="text-slate-500 text-sm font-bold leading-relaxed max-w-[200px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="size-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
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
