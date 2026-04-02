"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Camera, 
  Wrench, 
  User, 
  MapPin, 
  CheckCircle2, 
  X,
  Upload,
  ChevronRight,
  AlertCircle,
  Receipt,
  ShieldCheck
} from "lucide-react"

import { uploadBuktiServis } from "@/app/actions/teknisi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface WorkDocumentationProps {
  serviceData: {
    id: string
    status_servis: string
    biaya_dasar: number
    estimasi_biaya: number
    customer: {
      name: string
      phone: string
      address: string
    }
    teknisi: {
      name: string
      role: string
    }
    services: {
      nama: string
      harga: number
      unitPk: number
    }[]
    materials: {
      nama: string
      qty: number
      harga: number
    }[]
  }
}

export function WorkDocumentation({ serviceData }: WorkDocumentationProps) {
  const router = useRouter()
  // Only one photo needed now
  const [bukti, setBukti] = useState<File | null>(null)
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return
    setBukti(file)
    setBuktiPreview(URL.createObjectURL(file))
  }

  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!bukti) {
      setError("Foto Bukti Selesai Pengerjaan wajib diunggah.")
      return
    }

    setBusy(true)
    setError(null)
    try {
      const res = await uploadBuktiServis({ 
        serviceId: serviceData.id, 
        before: bukti, 
        after: bukti 
      })

      if (!res.success) {
        setError(res.message || "Gagal mengunggah bukti.")
        return
      }

      // Show success alert first
      setShowSuccess(true)
      
      // Delay redirect to allow user to see the success state
      setTimeout(() => {
        router.push("/dashboard/ongoing")
        router.refresh()
      }, 1800)
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-white overflow-hidden relative">
      {/* Success Floating Alert Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-500">
           <div className="flex flex-col items-center gap-6 p-12 bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50 scale-in-center animate-in zoom-in-95 duration-500">
              <div className="size-24 rounded-full bg-green-50 flex items-center justify-center text-[#66B21D] shadow-inner">
                 <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="text-center space-y-2">
                 <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight">Pengerjaan Berhasil!</h2>
                 <p className="text-sm font-bold text-slate-400">Bukti pengerjaan telah dikirim, redirecting...</p>
              </div>
           </div>
        </div>
      )}

      {/* Content Area - No double navbar header here */}
      <div className="max-w-[1240px] mx-auto w-full px-6 py-6 overflow-y-auto">
        
        {/* Compact Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Customer */}
          <div className="p-4 bg-[#FDFDFD] border border-[#F1F5F9] rounded-[24px] flex items-center gap-4 shadow-sm">
            <div className="size-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#64748B] shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Pelanggan</p>
              <p className="text-sm font-black text-[#0F172A] truncate">{serviceData.customer.name}</p>
            </div>
          </div>

          {/* Technician */}
          <div className="p-4 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[24px] flex items-center gap-4 shadow-sm">
            <div className="size-10 rounded-xl bg-white flex items-center justify-center text-[#66B21D] shrink-0">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-[#66B21D]/60 uppercase tracking-widest">Teknisi</p>
              <p className="text-sm font-black text-[#166534] truncate">{serviceData.teknisi.name}</p>
            </div>
          </div>

          {/* Status/Badge info */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-[24px] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
               <Badge className="bg-[#66B21D] text-white hover:bg-[#66B21D] font-black text-[9px] px-2.5 py-0.5 rounded-md uppercase tracking-wider border-none">
                  Step 6
               </Badge>
               <span className="text-[12px] font-black text-[#0F172A]">#{serviceData.id.slice(-8).toUpperCase()}</span>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sedang Dikerjakan</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Photo Documentation (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-[#F1F5F9] rounded-[32px] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
                <h3 className="text-base font-black text-[#0F172A] uppercase tracking-tight">Foto Bukti Pengerjaan</h3>
              </div>
              <div className="p-6">
                <label 
                  className={`
                    relative flex flex-col items-center justify-center h-[340px] rounded-[24px] border-4 border-dashed transition-all cursor-pointer overflow-hidden
                    ${buktiPreview ? "border-[#66B21D] bg-white text-[#66B21D]" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#66B21D] hover:bg-[#F0FDF4] text-[#94A3B8]"}
                  `}
                >
                  {buktiPreview ? (
                    <img src={buktiPreview} alt="Bukti" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-center px-4">
                      <div className="size-16 rounded-2xl bg-white flex items-center justify-center text-inherit shadow-lg group-hover:scale-110 transition-transform">
                        <Camera className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-[#0F172A]">Sentuh untuk Foto</p>
                        <p className="text-sm font-bold text-[#94A3B8] mt-1">Harus memperlihatkan unit AC yang telah selesai</p>
                      </div>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} disabled={busy} />
                  
                  {buktiPreview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="bg-white rounded-full p-4 text-[#0F172A] shadow-2xl">
                          <Upload className="h-6 w-6" />
                       </div>
                    </div>
                  )}
                </label>
              </div>
            </Card>
          </div>

          {/* Right Column: Billing Breakdown (7/12) */}
          <div className="lg:col-span-7">
            <Card className="border-[#F1F5F9] rounded-[32px] overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.02)]">
              <div className="p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Receipt className="h-5 w-5 text-[#66B21D]" />
                   <h3 className="text-base font-black text-[#0F172A] uppercase tracking-tight">Rincian Biaya Servis</h3>
                </div>
                <Badge variant="outline" className="text-[10px] font-black text-[#94A3B8] border-[#E2E8F0]">Lampiran Tagihan</Badge>
              </div>
              <div className="p-8 space-y-6">
                
                {/* Visit Fee */}
                <div className="flex justify-between items-center group">
                  <div className="space-y-0.5">
                    <p className="text-sm font-black text-[#334155]">Biaya Kunjungan & Transport</p>
                    <p className="text-[11px] font-bold text-[#94A3B8]">Pemeriksaan standar & akomodasi teknisi</p>
                  </div>
                  <p className="text-sm font-black text-[#0F172A]">Rp {serviceData.biaya_dasar.toLocaleString('id-ID')}</p>
                </div>

                <Separator className="bg-[#F1F5F9]" />

                {/* Services */}
                <div className="space-y-4">
                  {serviceData.services.length > 0 ? (
                    serviceData.services.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-2 rounded-full bg-[#66B21D] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-black text-[#334155] truncate">{s.nama}</p>
                            <p className="text-[11px] font-bold text-[#94A3B8]">Unit {s.unitPk} PK</p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-[#0F172A]">Rp {s.harga.toLocaleString('id-ID')}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] font-bold text-[#94A3B8] italic">Tidak ada rincian layanan tambahan</p>
                  )}
                </div>

                {serviceData.materials.length > 0 && <Separator className="bg-[#F1F5F9]" />}

                {/* Materials */}
                <div className="space-y-4">
                  {serviceData.materials.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-2 rounded-full bg-[#F97316] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-black text-[#334155] truncate">{m.nama}</p>
                          <p className="text-[11px] font-bold text-[#94A3B8]">Suku Cadang x {m.qty}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-[#0F172A]">Rp {(m.qty * m.harga).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>

                {/* Grand Total Area */}
                <div className="mt-8 p-6 bg-[#0F172A] rounded-[24px] flex items-center justify-between text-white">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Total Pembayaran</p>
                    <p className="text-[11px] font-bold text-white/60 italic">Sudah termasuk PPN 11%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black tracking-tight">Rp {serviceData.estimasi_biaya.toLocaleString('id-ID')}</p>
                  </div>
                </div>

                {/* Warranty Info */}
                <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl">
                   <ShieldCheck className="h-4 w-4 text-[#66B21D]" />
                   <p className="text-[11px] font-bold text-[#166534]">Layanan ini dilindungi garansi TIAM AC selama 30 hari.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-xs font-black text-red-600 uppercase tracking-wide">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8 pb-10">
           <Button 
             onClick={handleSubmit}
             disabled={busy || showSuccess}
             className="h-16 w-full rounded-[24px] bg-[#0F172A] hover:bg-[#1E293B] text-white flex items-center justify-center gap-3 shadow-xl transition-all group"
           >
             <span className="text-sm font-black uppercase tracking-[0.2em]">
               {busy ? "Memproses..." : showSuccess ? "Pengerjaan Selesai!" : "Submit & Selesaikan Pengerjaan"}
             </span>
             {!busy && !showSuccess && <ChevronRight className="h-5 w-5 text-[#66B21D] group-hover:translate-x-1 transition-transform" />}
           </Button>
        </div>

      </div>
    </div>
  )
}
