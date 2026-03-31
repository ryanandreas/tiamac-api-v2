import { SiteNavbar } from "@/components/site-navbar"
import FooterSection from "@/components/footer"
import { getCurrentUser } from "@/app/actions/session"
import Image from "next/image"
import { Smartphone, Zap, ShieldCheck, Clock } from "lucide-react"
import { MobileHeroCarousel } from "@/components/mobile/hero-carousel"

export default async function MobileAppPage() {
  const current = await getCurrentUser()

  const features = [
    {
      icon: Zap,
      title: "Pesan dalam 1 Menit",
      desc: "Antarmuka yang dioptimalkan untuk kecepatan. Bayar dalam hitungan detik."
    },
    {
      icon: ShieldCheck,
      title: "Aman & Terjamin",
      desc: "Semua teknisi kami tersertifikasi dan data transaksi dilindungi."
    },
    {
      icon: Clock,
      title: "Pantau Real-time",
      desc: "Dapatkan notifikasi status teknisi Anda langsung di ponsel."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <SiteNavbar user={current} mode="sticky" />

      {/* Hero Section - Super compact on mobile */}
      <section className="relative min-h-[calc(100vh-80px)] lg:min-h-0 pt-4 lg:pt-16 pb-2 lg:pb-12 flex flex-col justify-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-green-50 rounded-full blur-3xl opacity-60 translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl opacity-60 -translate-x-1/4 translate-y-1/4"></div>

        <div className="mx-auto max-w-7xl px-6 md:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-16 items-center">
            {/* Carousel - Higher on Mobile */}
            <div className="relative flex justify-center items-center order-1 lg:order-2 h-[260px] md:h-auto -mt-6 lg:mt-0">
               <div className="scale-[0.55] md:scale-[0.85] lg:scale-100 transition-all duration-500 origin-center lg:origin-center">
                  <MobileHeroCarousel />
               </div>
            </div>

            {/* Left Content - Balanced on mobile */}
            <div className="relative z-10 text-center lg:text-left order-2 lg:order-1 mt-14 md:mt-0 lg:mt-0">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#66B21D]/10 text-[#66B21D] text-[10px] md:text-xs font-bold mb-3 md:mb-8 uppercase tracking-widest">
                <Smartphone className="size-3 md:size-4" />
                Aplikasi Tiam AC v1.0
              </div>
              <h1 className="text-2xl md:text-5xl font-bold text-slate-900 mb-3 md:mb-8 tracking-tight leading-[1.1]">
                Kendali Udara Bersih <br />
                <span className="text-[#66B21D]">Dalam Genggaman.</span>
              </h1>
              <p className="text-xs md:text-lg text-slate-600 font-medium mb-5 md:mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Pesan servis AC lewat satu aplikasi cerdas.
              </p>

              {/* Download Buttons - Small on Mobile */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-4">
                  <a 
                    href="#" 
                    className="hover:scale-105 active:scale-95 transition-all duration-300 drop-shadow-xl hover:drop-shadow-2xl rounded-xl overflow-hidden shadow-slate-900/10"
                  >
                    <Image 
                      src="/images/appstore.svg" 
                      alt="Download on App Store" 
                      width={160} 
                      height={50} 
                      className="h-9 md:h-14 w-auto object-contain"
                    />
                  </a>
                  <a 
                    href="#" 
                    className="hover:scale-105 active:scale-95 transition-all duration-300 drop-shadow-xl hover:drop-shadow-2xl rounded-xl overflow-hidden shadow-slate-900/10"
                  >
                    <Image 
                      src="/images/googleplay.svg" 
                      alt="Get it on Google Play" 
                      width={160} 
                      height={50} 
                      className="h-9 md:h-14 w-auto object-contain"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Ultra Compact on Mobile */}
      <section className="py-6 md:py-16 bg-white border-t border-slate-50">
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid grid-cols-3 gap-3 md:gap-12">
            {features.map((f, i) => (
              <div key={i} className="group relative p-4 md:p-10 bg-green-50/70 rounded-[1.5rem] md:rounded-[3.5rem] border-0 shadow-none overflow-hidden transition-all duration-500 hover:bg-green-100/50 hover:-translate-y-2">
                 {/* Premium Fading Bottom */}
                <div className="absolute inset-x-0 bottom-0 h-16 md:h-40 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none opacity-80"></div>
                
                <div className="relative z-10">
                  <div className="size-10 md:size-16 rounded-xl md:rounded-[1.75rem] relative overflow-hidden bg-linear-to-b from-[#66B21D]/60 to-[#66B21D]/20 flex items-center justify-center text-white mb-4 md:mb-10 shadow-none group-hover:scale-110 group-hover:from-[#66B21D] group-hover:to-[#4d9e0f] transition-all duration-500">
                    <f.icon className="size-5 md:size-8 stroke-[2.5px] relative z-10" />
                  </div>
                  <h3 className="text-[10px] md:text-2xl font-bold text-slate-900 mb-1 md:mb-5 tracking-tight leading-tight">{f.title}</h3>
                  <p className="hidden md:block text-slate-500 font-medium leading-relaxed text-sm pb-16">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Ultra Compact Spacing */}
      <section className="py-6 md:py-16 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 md:px-12">
          <div className="bg-linear-to-br from-green-50 via-green-100/40 to-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 relative overflow-hidden text-center md:text-left group">
            {/* Decorative Background Image */}
            <div className="absolute -right-16 md:-right-24 -bottom-24 md:-bottom-32 w-[220px] md:w-[450px] opacity-15 md:opacity-25 -rotate-12 group-hover:-rotate-6 transition-all duration-1000">
              <Image
                src="/images/mockiphone/screen3.png"
                alt="App UI Decoration"
                width={600}
                height={1200}
                className="w-full h-auto drop-shadow-2xl opacity-80"
              />
            </div>

            {/* Abstract shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#66B21D] rounded-full blur-[100px] md:blur-[120px] opacity-5 md:opacity-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] md:blur-[120px] opacity-5 md:opacity-10 -translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10 max-w-xl mx-auto md:mx-0">
              <h2 className="text-2xl md:text-5xl font-bold text-slate-800 mb-6 md:mb-8 tracking-tight leading-tight">
                Unduh Aplikasi <br />
                Gratis
              </h2>
              <p className="text-xs md:text-lg text-slate-600 font-medium mb-8 md:mb-12 leading-relaxed">
                Bebaskan diri dari kerumitan merawat AC. Biarkan sistem cerdas kami membantu Anda.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 justify-center md:justify-start">
                <a href="#" className="hover:scale-110 active:scale-90 transition-all drop-shadow-2xl rounded-2xl overflow-hidden w-fit">
                  <Image
                    src="/images/appstore.svg"
                    alt="Download on App Store"
                    width={180}
                    height={60}
                    className="h-11 md:h-14 w-auto object-contain"
                  />
                </a>
                <a href="#" className="hover:scale-110 active:scale-90 transition-all drop-shadow-2xl rounded-2xl overflow-hidden w-fit">
                  <Image
                    src="/images/googleplay.svg"
                    alt="Get it on Google Play"
                    width={180}
                    height={60}
                    className="h-11 md:h-14 w-auto object-contain"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  )
}
