'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import Image from "next/image"
import { ArrowRight, User, Phone, Mail, MapPin, Lock, ChevronDown } from "lucide-react"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Buat Akun Baru</h1>
        <p className="text-slate-500 font-bold">Bergabunglah dengan layanan perawatan AC terbaik.</p>
      </div>

      <form className="space-y-6">
        <div className="space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Budi Santoso"
                required
                className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="no_telp" className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
                <Input
                  id="no_telp"
                  name="tel"
                  type="tel"
                  placeholder="081234567890"
                  required
                  className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
                />
              </div>
            </div>

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
          </div>

          {/* Location Fields Container */}
          <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-5">
            {/* Provinsi Field */}
            <div className="space-y-2">
              <label htmlFor="provinsi" className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Wilayah Layanan (Provinsi)</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
                <select
                  id="provinsi"
                  name="provinsi"
                  className="w-full pl-11 pr-10 h-12 bg-white border-slate-100 rounded-xl focus:ring-2 focus:ring-[#66B21D] focus:outline-none transition-all font-bold text-sm appearance-none shadow-sm"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>Pilih Provinsi</option>
                  <option value="Jakarta Timur">Jakarta Timur</option>
                  <option value="Jakarta Selatan">Jakarta Selatan</option>
                  <option value="Jakarta Utara">Jakarta Utara</option>
                  <option value="Jakarta Barat">Jakarta Barat</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Alamat Field */}
            <div className="space-y-2">
              <label htmlFor="alamat" className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Alamat Lengkap</label>
              <textarea
                id="alamat"
                name="alamat"
                placeholder="Masukkan alamat lengkap rumah atau kantor Anda"
                required
                className="w-full p-4 min-h-[100px] bg-white border-slate-100 rounded-xl focus:ring-2 focus:ring-[#66B21D] focus:outline-none transition-all font-bold text-sm shadow-sm resize-none"
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Konfirmasi Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#66B21D] transition-colors" />
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 px-1">
          <input type="checkbox" id="terms" required className="size-4 mt-0.5 rounded border-slate-200 text-[#66B21D] focus:ring-[#66B21D]" />
          <label htmlFor="terms" className="text-sm font-bold text-slate-500 cursor-pointer select-none">
            Saya setuju dengan <Link href="#" className="text-[#66B21D] hover:underline">Syarat & Ketentuan</Link> dan <Link href="#" className="text-[#66B21D] hover:underline">Kebijakan Privasi</Link> Tiam AC.
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 bg-[#66B21D] hover:bg-[#4d9e0f] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-95 gap-2"
        >
          <span>Daftar Akun</span>
          <ArrowRight className="size-4" />
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm font-bold text-slate-500">
        Sudah punya akun? <Link href="/login" className="text-[#66B21D] font-black hover:underline underline-offset-4">Masuk Sekarang</Link>
      </p>
    </div>
  )
}
