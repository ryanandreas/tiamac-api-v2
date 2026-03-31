import type { Metadata } from "next"
import { LoginForm } from "@/components/login-form"
import { getCurrentUser } from "@/app/actions/session"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Tiam AC Anda untuk mengelola layanan dan pesanan AC.",
}

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user.isAuthenticated) {
    redirect(user.type === "staff" ? "/dashboard" : "/customer-panel/dashboard")
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-900">
      {/* Left Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      {/* Right Side: Visual Section */}
      <div className="hidden lg:flex flex-1 bg-slate-50 relative items-center justify-center p-12 overflow-hidden">
        {/* Abstract Ornaments */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-100/50 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-green-50/50 rounded-full blur-[120px]" />

        <div className="relative z-10 flex flex-col items-start text-left gap-10 max-w-lg">
          <div className="relative group">
            {/* Illustration */}
            <div className="w-[380px] aspect-square rounded-[30px] overflow-hidden">
              <img
                src="/images/login.png"
                alt="Modern AC Technician"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -right-12 bg-linear-to-br from-[#66B21D]/40 via-white/40 to-white/10 backdrop-blur-xl p-4 rounded-3xl flex items-center gap-4 animate-bounce-slow">
              <div className="size-11 rounded-2xl bg-[#66B21D] flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m12 8-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2Z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest mb-0.5">Puas & Bergaransi</div>
                <div className="text-base font-black text-slate-950 tracking-tight leading-none">12k+ Pelanggan</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
              Udara Sejuk, <br /> Hidup Lebih Nyaman.
            </h2>
            <p className="text-base text-slate-500 font-bold leading-relaxed max-w-sm">
              Solusi perawatan AC profesional untuk kenyamanan tanpa batas di setiap ruangan Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
