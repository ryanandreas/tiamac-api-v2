'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useActionState, useState, useEffect } from "react"
import { login } from "@/app/actions/auth"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react"

import Image from "next/image"
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(login, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (state && !state.success) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [state])

  return (
    <div className={cn("flex flex-col gap-10 w-full", className)} {...props}>
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 w-fit">
        <Image
          src="/images/logo.png"
          alt="Tiam AC Logo"
          width={40}
          height={40}
          className="h-10 w-auto object-contain"
        />
        <span className="text-2xl font-black text-slate-900 tracking-tight">AC Tiam</span>
      </Link>

      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Selamat Datang Kembali</h1>
        <p className="text-slate-500 font-bold tracking-tight">Senang melihat Anda kembali! Masuk untuk memastikan AC Anda tetap dingin dan terawat.</p>
      </div>

      {/* Login Form */}
      <form action={formAction} className="space-y-6">

        <div className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-black text-slate-900 tracking-widest ml-1">Alamat Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
                className="pl-11 h-12 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label htmlFor="password" className="text-xs font-black text-slate-900 tracking-widest">Kata Sandi</label>
              <a href="#" className="text-xs font-bold text-[#66B21D] hover:underline underline-offset-4 transition-all">Lupa sandi?</a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="pl-11 pr-11 h-12 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-1">
          <Checkbox id="remember" className="data-[state=checked]:bg-[#66B21D] data-[state=checked]:border-[#66B21D] border-slate-300" />
          <label htmlFor="remember" className="text-sm font-bold text-slate-500 cursor-pointer select-none">Ingat saya di perangkat ini</label>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-[#66B21D] hover:bg-[#4d9e0f] text-white rounded-xl font-black text-sm uppercase tracking-widest border-none shadow-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 gap-2"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Memproses...
            </span>
          ) : (
            <>
              <span>Masuk ke Akun</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Floating Error Alert */}
      {state && !state.success && showError && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 animate-in fade-in slide-in-from-top-8 duration-500">
          <div className="p-5 rounded-[24px] bg-white border border-rose-100 flex items-center gap-4 shadow-2xl shadow-rose-200/40 ring-4 ring-rose-50/50">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div className="text-left flex-1">
              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Login Gagal</p>
              <p className="text-xs font-bold text-slate-800 leading-tight uppercase tracking-tight">{state.message}</p>
            </div>
            <button 
              type="button"
              onClick={() => setShowError(false)}
              className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}

      {/* Social Login (Moved to bottom) */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">Atau Lanjutkan Dengan</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full h-12 rounded-xl bg-slate-50 hover:bg-slate-100 border-none shadow-none font-bold text-slate-700 transition-all gap-3"
        >
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="size-5" alt="Google" />
          <span>Masuk dengan Google</span>
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-sm font-bold text-slate-500">
        Belum punya akun? <a href="/signup" className="text-[#66B21D] font-black hover:underline underline-offset-4">Daftar Sekarang</a>
      </p>
    </div>
  )
}