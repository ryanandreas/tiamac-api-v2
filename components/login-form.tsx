'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useActionState, useState } from "react"
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
        <p className="text-slate-500 font-bold">Silakan masuk untuk mengelola pesanan AC Anda.</p>
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
            <label htmlFor="email" className="text-xs font-black text-slate-900 tracking-widest ml-1">Alamat Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
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
                placeholder="••••••••"
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
          className="w-full h-12 bg-[#66B21D] hover:bg-[#4d9e0f] text-white rounded-xl font-black text-sm tracking-widest border-none shadow-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 gap-2"
        >
          {isPending ? "Memproses..." : (
            <>
              <span>Masuk ke Akun</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

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