'use client'

import React, { useActionState, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import Image from "next/image"
import { ArrowRight, User, Phone, Mail, MapPin, Lock, ChevronDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { signup } from "@/app/actions/auth"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(signup, null)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (state && !state.success) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [state])
  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
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
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Buat Akun Baru</h1>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-5">
          {/* Name & Phone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-black text-slate-900 tracking-widest ml-1">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Nama Lengkap"
                  required
                  className="pl-11 h-12 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="no_telp" className="text-xs font-black text-slate-900 tracking-widest ml-1">Nomor WhatsApp</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
                <Input
                  id="no_telp"
                  name="no_telp"
                  type="tel"
                  placeholder="Nomor WhatsApp"
                  required
                  className="pl-11 h-12 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
                />
              </div>
            </div>
          </div>

          {/* Email & Region Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

            {/* Provinsi Field */}
            <div className="space-y-2">
              <label htmlFor="provinsi" className="text-xs font-black text-slate-900 tracking-widest ml-1">Wilayah Layanan (Provinsi)</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors z-10" />
                <Select name="provinsi" required>
                  <SelectTrigger className="w-full pl-11 pr-4 !h-12 bg-slate-50 border-none shadow-none rounded-xl focus:ring-1 focus:ring-[#66B21D] focus:outline-none transition-all font-bold text-sm text-slate-900 data-placeholder:text-slate-400">
                    <SelectValue placeholder="Pilih Provinsi" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl overflow-hidden bg-white/95 backdrop-blur-md">
                    <SelectItem value="Jakarta Timur" className="font-bold py-3 px-4 focus:bg-slate-50 focus:text-[#66B21D] cursor-pointer transition-colors">Jakarta Timur</SelectItem>
                    <SelectItem value="Jakarta Selatan" className="font-bold py-3 px-4 focus:bg-slate-50 focus:text-[#66B21D] cursor-pointer transition-colors">Jakarta Selatan</SelectItem>
                    <SelectItem value="Jakarta Utara" className="font-bold py-3 px-4 focus:bg-slate-50 focus:text-[#66B21D] cursor-pointer transition-colors">Jakarta Utara</SelectItem>
                    <SelectItem value="Jakarta Barat" className="font-bold py-3 px-4 focus:bg-slate-50 focus:text-[#66B21D] cursor-pointer transition-colors">Jakarta Barat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Alamat Field */}
          <div className="space-y-2">
            <label htmlFor="alamat" className="text-xs font-black text-slate-900 tracking-widest ml-1">Alamat Lengkap</label>
            <textarea
              id="alamat"
              name="alamat"
              placeholder="Alamat Lengkap"
              required
              className="w-full p-4 min-h-[100px] bg-slate-50 border-none shadow-none rounded-xl focus:ring-1 focus:ring-[#66B21D] focus:outline-none transition-all font-bold text-sm resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-black text-slate-900 tracking-widest ml-1">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimal 8 Karakter"
                  required
                  className="pl-11 h-12 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-xs font-black text-slate-900 tracking-widest ml-1">Konfirmasi Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="Ulangi Sandi"
                  required
                  className="pl-11 h-12 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 px-1">
          <Checkbox 
            id="terms" 
            required 
            className="size-4 mt-0.5 rounded border-slate-300 data-[state=checked]:bg-[#66B21D] data-[state=checked]:border-[#66B21D]" 
          />
          <label htmlFor="terms" className="text-sm font-bold text-slate-500 cursor-pointer select-none">
            Saya setuju dengan <Link href="#" className="text-[#66B21D] hover:underline">Syarat & Ketentuan</Link> dan <Link href="#" className="text-[#66B21D] hover:underline">Kebijakan Privasi</Link> Tiam AC.
          </label>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-[#66B21D] hover:bg-[#4d9e0f] text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 gap-2"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Memproses...
            </span>
          ) : (
            <>
              <span>Daftar Akun</span>
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
              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Pendaftaran Gagal</p>
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

      {/* Social Register */}
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
          <span>Daftar dengan Google</span>
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-sm font-bold text-slate-500">
        Sudah punya akun? <Link href="/login" className="text-[#66B21D] font-black hover:underline underline-offset-4">Masuk Sekarang</Link>
      </p>
    </div>
  )
}
