import { LoginForm } from "@/components/login-form"
import { getCurrentUser } from "@/app/actions/session"
import { redirect } from "next/navigation"

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
        
        <div className="relative z-10 flex flex-col items-center text-center gap-12 max-w-lg">
          <div className="relative group">
            {/* Illustration Container */}
            <div className="relative bg-white p-4 rounded-[48px] shadow-xl border border-white overflow-hidden ring-4 ring-slate-50">
              <div className="aspect-square w-[400px] bg-linear-to-b from-green-50 to-slate-50 rounded-[32px] overflow-hidden">
                <img 
                  src="/images/login-illustration.png" 
                  alt="Modern AC Technician" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-12 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white flex items-center gap-4 animate-bounce-slow">
              <div className="size-14 rounded-2xl bg-[#66B21D] flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Puas & Bergaransi</div>
                <div className="text-xl font-black text-slate-900 tracking-tight">12.4k+ Pelanggan</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
              Udara Bersih & Sejuk, <br/> Hanya Berjarak Satu Klik.
            </h2>
            <p className="text-lg text-slate-500 font-bold leading-relaxed max-w-md mx-auto">
              Nikmati layanan perawatan AC terbaik dengan teknisi handal yang siap datang ke lokasi Anda. Transparan, terpercaya, dan profesional.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
