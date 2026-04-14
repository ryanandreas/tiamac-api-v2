"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Camera, 
  CheckCircle2, 
  Upload,
  ChevronRight,
  AlertCircle,
  Receipt,
  ShieldCheck,
  User,
  MapPin,
  Clock
} from "lucide-react"

import { uploadBuktiServis } from "@/app/actions/teknisi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PengerjaanWorkstationProps {
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
      unitPk: string
    }[]
    materials: {
      nama: string
      qty: number
      harga: number
    }[]
  }
}

export function PengerjaanWorkstation({ serviceData }: PengerjaanWorkstationProps) {
  const router = useRouter()
  const [bukti, setBukti] = useState<File | null>(null)
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return
    setBukti(file)
    setBuktiPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!bukti) {
      setError("Foto Bukti Selesai Pengerjaan wajib diunggah.")
      return
    }

    setBusy(true)
    setError(null)
    setIsConfirmOpen(false)
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

      setShowSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/ongoing?msg=completed")
        router.refresh()
      }, 1500)
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in font-outfit">
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[32px] border-none shadow-2xl p-8 gap-6 animate-in zoom-in-95 duration-200">
          <DialogHeader className="flex flex-col items-center gap-4 text-center">
            <div className="size-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
               <AlertCircle className="size-8" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Selesaikan Pengerjaan?</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-400 leading-relaxed px-2">
                Pastikan unit telah diperbaiki dengan baik dan foto bukti sudah benar. Tindakan ini akan mengirimkan rincian biaya kepada pelanggan.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 h-12 rounded-2xl font-bold text-slate-400 border-none hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
            >
              Kembali
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={busy}
              className="flex-1 h-12 rounded-2xl bg-[#66B21D] hover:bg-[#57a118] text-white shadow-lg shadow-green-900/10 transition-all font-bold uppercase text-[10px] tracking-widest border-none"
            >
              {busy ? "Memproses..." : "Ya, Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
           <Card className="flex flex-col items-center gap-6 p-10 bg-white rounded-[32px] shadow-2xl border-none scale-in-center animate-in zoom-in-95 duration-300">
              <div className="size-20 rounded-full bg-green-50 flex items-center justify-center text-[#66B21D]">
                 <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="text-center space-y-1">
                 <h2 className="text-xl font-bold text-slate-900">Pengerjaan Berhasil!</h2>
                 <p className="text-sm font-medium text-slate-400">Menyelesaikan pencatatan, mohon tunggu...</p>
              </div>
           </Card>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Panel: Cost Review (Terminal Style) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-none shadow-none rounded-[32px] overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                 <Receipt className="h-4 w-4 text-[#66B21D]" />
                 <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Dashboard Finansial</h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-100 uppercase tracking-widest">Validasi Bill</Badge>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Visit Fee */}
              <div className="flex justify-between items-center group">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-slate-600">Biaya Kunjungan & Transport</p>
                  <p className="text-[10px] font-medium text-slate-400">Pemeriksaan & akomodasi teknisi</p>
                </div>
                <p className="text-sm font-bold text-slate-900">Rp {serviceData.biaya_dasar.toLocaleString('id-ID')}</p>
              </div>

              <Separator className="bg-slate-50" />

              {/* Service List */}
              <div className="space-y-3.5">
                {serviceData.services.length > 0 ? (
                  serviceData.services.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-50/50">
                      <div className="flex items-center gap-3 min-w-0 text-left">
                        <div className="size-2 rounded-full bg-[#66B21D] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{s.nama}</p>
                          <p className="text-[10px] font-medium text-slate-400">Unit {s.unitPk} PK</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-slate-900">Rp {s.harga.toLocaleString('id-ID')}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] font-semibold text-slate-300 italic text-center py-2">Tiada rincian layanan tambahan</p>
                )}
              </div>

              {/* Materials Section if any */}
              {serviceData.materials.length > 0 && (
                <>
                  <Separator className="bg-slate-50" />
                  <div className="space-y-3.5">
                    {serviceData.materials.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-orange-50/30 p-2.5 rounded-xl border border-orange-50/30">
                        <div className="flex items-center gap-3 min-w-0 text-left">
                          <div className="size-2 rounded-full bg-orange-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{m.nama}</p>
                            <p className="text-[10px] font-medium text-slate-400">Suku Cadang x {m.qty}</p>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-slate-900">Rp {(m.qty * m.harga).toLocaleString('id-ID')}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Total Block */}
              <div className="mt-8 p-5 bg-slate-900 rounded-3xl flex items-center justify-between text-white shadow-xl shadow-slate-900/10">
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Grand Total</p>
                  <div className="flex items-center gap-2">
                     <ShieldCheck className="size-3.5 text-[#66B21D]" />
                     <p className="text-[10px] font-bold text-white/50 italic leading-none">Bergaransi 30 Hari</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold tracking-tight">Rp {serviceData.estimasi_biaya.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel: Documentation & Submit */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-none shadow-none rounded-3xl overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-green-50 flex items-center justify-center text-[#66B21D]">
                  <Camera className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Dokumentasi Unit</h3>
              </div>
              <Badge variant="outline" className="text-[9px] font-bold text-slate-400 border-slate-100 bg-slate-50/50 uppercase tracking-widest">Wajib Upload</Badge>
            </div>
            <div className="p-5">
              <label 
                className={cn(
                  "relative flex flex-col items-center justify-center h-[280px] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group",
                  buktiPreview ? "border-[#66B21D] bg-white" : "border-slate-100 bg-slate-50/50 hover:border-[#66B21D] hover:bg-green-50/30"
                )}
              >
                {buktiPreview ? (
                  <img src={buktiPreview} alt="Bukti" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center px-4">
                    <div className="size-12 rounded-xl bg-white flex items-center justify-center text-slate-300 shadow-sm group-hover:text-[#66B21D] transition-colors">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Klik / Tap untuk Ambil Foto</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-1">Gunakan foto unit AC yang telah selesai diperbaiki</p>
                    </div>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} disabled={busy} />
                
                {buktiPreview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Button variant="secondary" size="sm" className="rounded-full bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/40">
                        <Camera className="h-4 w-4 mr-2" /> Ganti Foto
                     </Button>
                  </div>
                )}
              </label>
            </div>
          </Card>

          {/* Quick Info Mini Cards */}
          <div className="grid grid-cols-2 gap-3">
             <div className="p-4 bg-white rounded-2xl flex items-center gap-3 border-none shadow-none text-left">
                <div className="size-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pelanggan</p>
                  <p className="text-xs font-bold text-slate-900 truncate">{serviceData.customer.name}</p>
                </div>
             </div>
             <div className="p-4 bg-white rounded-2xl flex items-center gap-3 border-none shadow-none text-left">
                <div className="size-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lokasi</p>
                  <p className="text-xs font-bold text-slate-900 truncate">{serviceData.customer.address}</p>
                </div>
             </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">{error}</p>
            </div>
          )}

          {/* Final Action Button - Moved to Right column */}
          <div className="pt-2 pb-10">
              <Button 
                onClick={() => setIsConfirmOpen(true)}
                disabled={busy || showSuccess}
                className="h-16 w-full rounded-2xl bg-[#66B21D] hover:bg-[#57a118] text-white flex items-center justify-center gap-3 shadow-lg shadow-green-900/10 transition-all group border-none"
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  {busy ? "Mengirim Data..." : showSuccess ? "Selesai!" : "Pekerjaan Selesai"}
                </span>
                {!busy && !showSuccess && <ChevronRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />}
              </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
