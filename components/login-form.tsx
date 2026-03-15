'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useActionState } from "react"
import { login } from "@/app/actions/auth"
import { ArrowRight, Eye, Mail, Lock } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className={cn("flex flex-col gap-10 w-full", className)} {...props}>
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="size-10 bg-linear-to-br from-[#4d9e0f] to-[#66B21D] rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
          <span className="text-white font-extrabold text-sm tracking-tight">AC</span>
        </div>
        <span className="text-2xl font-black text-slate-900 tracking-tight">Tiam AC</span>
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Selamat Datang Kembali</h1>
        <p className="text-slate-500 font-bold">Silakan masuk untuk mengelola pesanan AC Anda.</p>
      </div>

      {/* Social Login */}
      <div className="space-y-4">
        <Button 
          variant="outline" 
          type="button"
          className="w-full h-12 rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all gap-3"
        >
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="size-5" alt="Google" />
          <span>Masuk dengan Google</span>
        </Button>
        
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Atau dengan Email</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
      </div>

      {/* Login Form */}
      <form action={formAction} className="space-y-6">
        {state?.message && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold animate-shake">
            {state.message}
          </div>
        )}

        <div className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Alamat Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label htmlFor="password" className="text-xs font-black text-slate-900 uppercase tracking-widest">Kata Sandi</label>
              <a href="#" className="text-xs font-bold text-[#66B21D] hover:underline underline-offset-4 transition-all">Lupa sandi?</a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••"
                required 
                className="pl-11 pr-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                <Eye className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-1">
          <input type="checkbox" id="remember" className="size-4 rounded border-slate-200 text-[#66B21D] focus:ring-[#66B21D]" />
          <label htmlFor="remember" className="text-sm font-bold text-slate-500 cursor-pointer select-none">Ingat saya di perangkat ini</label>
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full h-14 bg-[#66B21D] hover:bg-[#4d9e0f] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 gap-2"
        >
          {isPending ? "Memproses..." : (
            <>
              <span>Masuk ke Akun</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm font-bold text-slate-500">
        Belum punya akun? <a href="/signup" className="text-[#66B21D] font-black hover:underline underline-offset-4">Daftar Sekarang</a>
      </p>
    </div>
  )
}