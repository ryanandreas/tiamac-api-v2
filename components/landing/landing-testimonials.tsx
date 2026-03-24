"use client"

import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Andi Saputra",
    role: "Rumah Tangga",
    content: "Layanan cuci AC yang sangat bersih dan rapi. Teknisi datang tepat waktu dan harganya sangat transparan. Sangat direkomendasikan!",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?u=1",
  },
  {
    name: "Budi Hermawan",
    role: "Pemilik Kafe",
    content: "Sudah berlangganan untuk perawatan AC di kafe saya. Teknisi sangat profesional dan paham teknis. AC jadi lebih dingin dan awet.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?u=2",
  },
  {
    name: "Citra Lestari",
    role: "Apartemen",
    content: "Servis yang sangat memuaskan. Tidak ada biaya tambahan yang aneh-aneh. Garansi servisnya juga memberikan rasa aman.",
    rating: 5,
    avatar: "https://i.pravatar.cc/100?u=3",
  },
]

export function LandingTestimonials() {
  return (
    <section id="testimoni" className="py-24 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Apa Kata Pelanggan Kami?
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Kepercayaan Anda adalah prioritas kami. Berikut adalah pengalaman dari mereka yang telah menggunakan layanan Tiam AC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div 
              key={index} 
              className="group bg-slate-50 p-10 rounded-[2.5rem] relative transition-all duration-500 hover:bg-white hover:ring-8 hover:ring-slate-50"
            >
              <div className="absolute top-8 right-10 text-[#66B21D]/20 group-hover:text-[#66B21D]/40 transition-colors">
                <Quote className="size-12" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-slate-600 font-semibold leading-relaxed mb-8 relative z-10">
                "{t.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-slate-200 overflow-hidden">
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{t.name}</h4>
                  <p className="text-[11px] font-medium text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
