'use client'

import { useState } from "react"
import { Truck, Phone, ArrowRight, Clock, Eye } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { ServiceStatusHistoryDialog } from "@/components/dashboard/service-status-history-dialog"
import { format, parse } from "date-fns"
import { id } from "date-fns/locale"

interface OngoingTableBodyProps {
  services: any[]
}

function formatJadwalParts(keluhan: string) {
  const match = keluhan.match(/^Jadwal:\s*(.+)$/im)
  const fullJadwal = match?.[1]?.trim()

  if (!fullJadwal) return { date: "N/A", time: "" }
  
  try {
    // Expected seed format: "YYYY-MM-DD HH:mm"
    const parsedDate = parse(fullJadwal, "yyyy-MM-dd HH:mm", new Date())
    
    return {
      date: format(parsedDate, "dd MMMM yyyy", { locale: id }),
      time: format(parsedDate, "HH:mm", { locale: id })
    }
  } catch (e) {
    // Fallback if format is different (e.g. from real booking form)
    return {
      date: fullJadwal.split(' ')[0] || fullJadwal,
      time: fullJadwal.split(' ')[1] || ""
    }
  }
}

export function OngoingTableBody({ services }: OngoingTableBodyProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  const openDetail = (id: string) => {
    setSelectedServiceId(id)
    setDetailOpen(true)
  }

  return (
    <TooltipProvider>
      <TableBody>
        {services.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="py-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-2">
                  <Truck className="h-6 w-6" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada pekerjaan aktif saat ini</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          services.map((s) => {
            const isKonfirmasi = s.status_servis === "Konfirmasi Teknisi"
            const isPengecekan = s.status_servis === "Pengecekan Unit"
            const isWaitingApproval = s.status_servis === "Menunggu Persetujuan Customer"
            const isWorking = s.status_servis === "Perbaikan Unit"
            const isPayment = s.status_servis === "Menunggu Pembayaran"

            const actionUrl = (isKonfirmasi || isPengecekan)
              ? `/dashboard/pengecekan/${s.id}` 
              : (isWorking || isPayment)
                ? `/dashboard/pengerjaan/${s.id}`
                : `/dashboard/pengecekan/${s.id}` 

            const buttonLabel = isWaitingApproval 
              ? "Konfirmasi" 
              : isPayment 
                ? "Menunggu Bayar" 
                : isKonfirmasi 
                  ? "Konfirmasi" 
                  : isWorking 
                    ? "Lanjutkan" 
                    : "Proses Unit"

            const { date, time } = formatJadwalParts(s.keluhan ?? "")

            return (
              <TableRow key={s.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                <TableCell className="py-6 pl-8 font-outfit">
                   <span className="text-[10px] font-black text-slate-900 group-hover:text-[#66B21D] tracking-widest uppercase py-1 px-2.5 bg-slate-100 rounded-lg">#{s.id.slice(0, 8).toUpperCase()}</span>
                </TableCell>
                <TableCell className="py-6 font-outfit">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">{date}</span>
                    {time && <span className="text-[10px] font-bold text-slate-400 mt-0.5">{time} WIB</span>}
                  </div>
                </TableCell>
                <TableCell className="py-6 font-outfit">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{s.customer?.name || "-"}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="size-3 text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 tracking-tight">{s.customer?.customerProfile?.no_telp || "-"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6 text-center font-outfit">
                  <Badge 
                    variant="secondary" 
                    className={`font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg whitespace-nowrap border-none ${
                      isKonfirmasi ? "bg-blue-50 text-blue-600" :
                      isPengecekan ? "bg-amber-50 text-amber-600" : 
                      isWorking ? "bg-green-50 text-[#66B21D]" : 
                      isPayment ? "bg-purple-50 text-purple-600" :
                      "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {s.status_servis}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-6 pr-8 font-outfit">
                  <div className="flex items-center justify-end gap-3">
                    {/* Primary Task Action Button */}
                    <Button 
                      className={`h-10 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2.5 transition-all shadow-lg ${
                        isPayment
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100 shadow-none border border-slate-200" 
                        : "bg-[#66B21D] hover:bg-[#4d9e0f] text-white shadow-green-500/10"
                      }`} 
                      asChild={!isPayment}
                      disabled={isPayment}
                    >
                      {isPayment ? (
                        <>
                          <Clock className="size-3.5" />
                          {buttonLabel}
                        </>
                      ) : (
                        <Link href={actionUrl}>
                          {buttonLabel}
                          <ArrowRight className="size-3.5" />
                        </Link>
                      )}
                    </Button>

                    {/* Secondary Detail Button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost"
                          onClick={() => openDetail(s.id)}
                          className="h-10 w-10 p-0 rounded-2xl border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-[#66B21D] transition-all"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-xl px-4 py-2 font-bold text-[10px] uppercase tracking-widest bg-slate-900 border-none">
                        Lihat Detail
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>

      <ServiceStatusHistoryDialog 
        open={detailOpen}
        onOpenChange={setDetailOpen}
        serviceId={selectedServiceId}
        mode="staff"
      />
    </TooltipProvider>
  )
}
