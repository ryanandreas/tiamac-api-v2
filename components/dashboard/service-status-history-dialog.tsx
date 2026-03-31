"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Cpu, 
  Calendar,
  AlertCircle,
  Loader2,
  Package,
  Wrench,
  ChevronRight
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { getServiceDetail } from "@/app/actions/booking"
import { SERVICE_STEPS, getStepIndex } from "@/lib/constants/service-steps"

interface ServiceStatusHistoryDialogProps {
  serviceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ServiceStatusHistoryDialog({
  serviceId,
  open,
  onOpenChange
}: ServiceStatusHistoryDialogProps) {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open && serviceId) {
      fetchDetail()
    } else {
      setData(null)
      setError(null)
    }
  }, [open, serviceId])

  const fetchDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getServiceDetail(serviceId!)
      if (res) {
        setData(res)
      } else {
        setError("Data servis tidak ditemukan")
      }
    } catch (err) {
      console.error(err)
      setError("Gagal mengambil rincian servis")
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = data ? getStepIndex(data.status_servis) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full p-0 overflow-hidden border-none rounded-[32px] shadow-2xl bg-white focus:outline-none">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-[#66B21D] animate-spin" />
            <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-[0.2em]">Memuat Detail...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-10">
            <div className="size-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-2">
                <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{error}</h3>
            <Button variant="outline" onClick={fetchDetail} className="mt-4 rounded-xl font-bold">Coba Lagi</Button>
          </div>
        ) : data ? (
          <div className="flex flex-col max-h-[95vh]">
            {/* Header & Progress */}
            <div className="p-10 pb-6 border-b border-slate-50 bg-slate-50/30">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                <div className="space-y-3 text-center md:text-left pt-2">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">
                        Detail Pengerjaan Servis
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 font-bold text-sm">
                        Rincian status dan riwayat pengerjaan servis AC Anda secara real-time.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                    <Badge variant="outline" className="bg-green-100/30 border-green-200 text-[#66B21D] px-3 py-1 rounded-xl font-black text-[10px] uppercase tracking-widest">
                        ORDER #{data.id.slice(0, 8).toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="bg-slate-100/50 border-slate-200 text-slate-500 px-3 py-1 rounded-xl font-black text-[10px] uppercase tracking-widest">
                        {data.jenis_servis}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-center shrink-0">
                    <div className="px-6 py-4 rounded-[24px] bg-white border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-[#66B21D]/20 transition-all">
                        <div className="size-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 transition-transform group-hover:scale-110">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 opacity-60">Status Sekarang</p>
                            <p className="text-sm font-black text-slate-900 tracking-tight">{data.status_servis}</p>
                        </div>
                    </div>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="relative pb-8 px-6">
                <div className="absolute top-5 left-10 right-10 h-2 bg-slate-100 rounded-full" />
                <div 
                    className="absolute top-5 left-10 h-2 bg-[#66B21D] rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(102,178,29,0.3)]" 
                    style={{ width: `${(currentStepIndex / (SERVICE_STEPS.length - 1)) * 96}%` }}
                />
                <div className="relative flex justify-between">
                  {SERVICE_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex
                    const isCurrent = idx === currentStepIndex
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-4 group">
                        <div className={`
                          size-12 rounded-[18px] flex items-center justify-center z-10 transition-all duration-500
                          ${isCompleted ? 'bg-[#66B21D] text-white shadow-xl shadow-green-200/50 scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'}
                          ${isCurrent ? 'ring-4 ring-green-50 animate-pulse' : ''}
                        `}>
                          {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <span className="text-xs font-black">{idx + 1}</span>}
                        </div>
                        <span className={`
                          text-[10px] font-black uppercase tracking-tighter text-center max-w-[85px] leading-tight transition-all duration-500
                          ${isCompleted ? 'text-[#66B21D]' : 'text-slate-300'}
                          ${isCurrent ? 'scale-110 translate-y-1' : ''}
                        `}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-50">
                
                {/* Left: Info */}
                <div className="lg:col-span-3 p-8 space-y-10">
                    {/* Customer & Technician */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <div className="size-5 rounded bg-slate-50 flex items-center justify-center text-slate-400"><User className="h-3 w-3" /></div>
                                Informasi Pelanggan
                            </h4>
                            <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50/50 border border-slate-50 hover:bg-white hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/20 transition-all">
                                <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-black text-sm">
                                    {data.customer?.name?.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-900 truncate">{data.customer?.name}</p>
                                    <p className="text-[11px] font-bold text-slate-400 truncate">{data.customer?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <div className="size-5 rounded bg-green-50 flex items-center justify-center text-[#66B21D]"><Wrench className="h-3 w-3" /></div>
                                Teknisi Bertugas
                            </h4>
                            {data.teknisi ? (
                                <div className="flex items-center gap-4 p-5 rounded-3xl bg-green-50/30 border border-green-50/50 hover:bg-white hover:border-[#66B21D]/20 hover:shadow-xl hover:shadow-green-200/20 transition-all">
                                    <div className="size-12 rounded-2xl bg-white border border-green-50 flex items-center justify-center text-[#66B21D] font-black text-sm">
                                        {data.teknisi.name?.slice(0,2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-900">{data.teknisi.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="size-1.5 rounded-full bg-[#66B21D]" />
                                            <p className="text-[11px] font-bold text-[#66B21D]">Teknisi Profesional</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[73px] flex items-center justify-center px-6 rounded-3xl bg-slate-50/50 border border-dashed border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 italic">Teknisi belum ditugaskan</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AC Units */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="size-5 rounded bg-blue-50 flex items-center justify-center text-blue-500"><Cpu className="h-3 w-3" /></div>
                            Daftar Unit AC & Layanan
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.acUnits?.map((unit: any, idx: number) => (
                                <div key={unit.id} className="p-5 rounded-[24px] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black group-hover:bg-[#66B21D] transition-colors">
                                                {String(idx+1).padStart(2, '0')}
                                            </div>
                                            <p className="text-xs font-black text-slate-900">AC {idx+1}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-black h-5 border-slate-100 text-slate-400 px-2">
                                            {unit.pk} PK
                                        </Badge>
                                    </div>
                                    <div className="space-y-1.5 mt-4">
                                        {unit.layanan.map((l: any) => (
                                            <div key={l.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50/50">
                                                <span className="text-[10px] font-bold text-slate-600 flex items-center gap-2">
                                                    <ChevronRight className="h-2.5 w-2.5 text-[#66B21D]" />
                                                    {l.nama}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-900">
                                                    Rp {l.harga.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="size-5 rounded bg-orange-50 flex items-center justify-center text-orange-500"><MapPin className="h-3 w-3" /></div>
                            Lokasi Pengerjaan
                        </h4>
                        <div className="p-6 rounded-[28px] bg-slate-50/50 border border-slate-100 flex items-start gap-4">
                            <div className="size-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#66B21D] shrink-0 shadow-sm">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-slate-900">Alamat Lengkap</p>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-md">
                                    {data.keluhan.split('\n').find((l: string) => l.trim().toLowerCase().startsWith('alamat:'))?.replace(/alamat:\s*/i, '') || "Alamat tidak tersedia"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: History */}
                <div className="lg:col-span-2 p-8 bg-slate-50/20 space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                        <div className="size-5 rounded bg-purple-50 flex items-center justify-center text-purple-500"><Clock className="h-3 w-3" /></div>
                        Riwayat Perubahan Status
                    </h4>
                    
                    <div className="relative space-y-8 pl-4">
                        <div className="absolute top-0 bottom-0 left-[21px] w-0.5 bg-slate-100" />
                        
                        {data.statusHistory && data.statusHistory.length > 0 ? (
                            data.statusHistory.map((history: any, idx: number) => (
                                <div key={history.id} className="relative pl-10 group">
                                    <div className={`
                                        absolute left-0 top-0 size-11 rounded-2xl border-4 border-slate-50 z-10 flex items-center justify-center transition-all duration-300
                                        ${idx === 0 ? 'bg-[#66B21D] shadow-lg shadow-green-100 scale-110' : 'bg-white'}
                                    `}>
                                        {idx === 0 ? (
                                            <CheckCircle2 className="h-5 w-5 text-white" />
                                        ) : (
                                            <div className="size-2 rounded-full bg-slate-200 group-hover:bg-[#66B21D]/30 transition-colors" />
                                        )}
                                    </div>
                                    <div className="space-y-1 pt-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`text-xs font-black tracking-tight ${idx === 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                                                {history.status}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                                {formatDistanceToNow(new Date(history.createdAt), { addSuffix: true, locale: localeId })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic opacity-80 decoration-slate-200">
                                            &ldquo;{history.notes || "Tidak ada catatan"}&rdquo;
                                        </p>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">
                                            {format(new Date(history.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-3">
                                <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-200 mx-auto">
                                    <History className="h-6 w-6" />
                                </div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Belum ada riwayat</p>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-50 bg-white flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-green-50 flex items-center justify-center text-[#66B21D] font-black text-lg">
                        Rp
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Total Biaya Pengerjaan</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">
                            {/* Standardizing formatRupiah inline to avoid dependency issues if helper not found */}
                            {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                            }).format(data.biaya || data.estimasi_biaya || 0)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                        onClick={() => onOpenChange(false)}
                        className="flex-1 sm:flex-none h-12 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                    >
                        Tutup Rincian
                    </Button>
                </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function History({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="m12 7v5l4 2" />
    </svg>
  )
}
