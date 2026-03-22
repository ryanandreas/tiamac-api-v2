import { SignupForm } from "@/components/signup-form"
import { getCurrentUser } from "@/app/actions/session"
import { redirect } from "next/navigation"

export default async function SignupPage() {
  const user = await getCurrentUser()
  if (user.isAuthenticated) {
    if (user.type === "staff") {
      redirect("/dashboard")
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-slate-900">
        {/* Left Side: Signup Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 bg-white overflow-y-auto">
          <div className="w-full max-w-lg">
            <SignupForm />
          </div>
        </div>

        {/* Right Side: Visual Section */}
        <div className="hidden lg:flex flex-1 bg-slate-50 relative items-center justify-center p-12 overflow-hidden">
          {/* Abstract Ornaments */}
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-100/50 rounded-full blur-[100px]" />
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-green-50/50 rounded-full blur-[120px]" />
          
          <div className="relative z-10 flex flex-col items-center text-center gap-12 max-w-lg">
            <div className="relative group">
              {/* Illustration Container */}
              <div className="absolute inset-0 bg-white rounded-[48px] -rotate-3 -translate-y-2 shadow-2xl shadow-slate-200/50 transition-transform group-hover:-rotate-1 group-hover:-translate-y-4 duration-500" />
              <div className="relative bg-white p-4 rounded-[48px] shadow-xl border border-white overflow-hidden ring-4 ring-slate-50">
                <div className="aspect-square w-[400px] bg-linear-to-b from-green-50 to-slate-50 rounded-[32px] overflow-hidden">
                  <img 
                    src="/images/register-illustration.png" 
                    alt="Modern AC Service Community" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Floating Benefits Card */}
              <div className="absolute -top-12 -right-12 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white flex flex-col gap-4 animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-[#66B21D] flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                    <span className="text-sm">⚡</span>
                  </div>
                  <div className="text-left font-black text-slate-900 tracking-tight">Layanan Cepat</div>
                </div>
                <div className="flex items-center gap-4 border-t border-slate-100 pt-3">
                  <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <span className="text-sm">🛡️</span>
                  </div>
                  <div className="text-left font-black text-slate-900 tracking-tight">Bergaransi</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                Bergabung dengan <br/> Ribuan Pelanggan Puas.
              </h2>
              <p className="text-lg text-slate-500 font-bold leading-relaxed max-w-md mx-auto">
                Dapatkan akses ke fitur booking prioritas, riwayat servis yang teratur, dan penawaran eksklusif hanya untuk member Tiam AC.
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}
