'use client'

import { useState } from "react"
import { MapPin, Phone, Eye, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ServiceStatusHistoryDialog } from "@/components/dashboard/service-status-history-dialog"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"

interface JadwalTableBodyProps {
  rows: any[]
}

export function JadwalTableBody({ rows }: JadwalTableBodyProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  const openDetail = (id: string) => {
    setSelectedServiceId(id)
    setDetailOpen(true)
  }

  return (
    <TooltipProvider>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="py-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-2">
                  <Calendar className="h-6 w-6" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Belum ada jadwal servis terdaftar</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((s) => (
            <TableRow key={s.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
              <TableCell className="py-6 pl-8 font-outfit">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{s.jadwal || "-"}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Estimasi Kunjungan</span>
                </div>
              </TableCell>
              <TableCell className="py-6 font-outfit">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{s.customer?.name || "-"}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-3.5 w-3.5 text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-tight">{s.customer?.customerProfile?.no_telp || "-"}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-6 font-outfit">
                <div className="flex items-start gap-2 max-w-[200px]">
                  <MapPin className="h-3.5 w-3.5 text-slate-300 mt-0.5 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-400 line-clamp-2 leading-relaxed">{s.customer?.customerProfile?.alamat || "-"}</span>
                </div>
              </TableCell>
              <TableCell className="py-6 text-center font-outfit">
                <Badge 
                  variant="secondary" 
                  className={`font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg whitespace-nowrap border-none
                    ${s.status_servis === "Perbaikan Unit" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}
                  `}
                >
                  {s.status_servis}
                </Badge>
              </TableCell>
              <TableCell className="text-right py-6 pr-8 font-outfit">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost"
                      onClick={() => openDetail(s.id)}
                      className="h-10 w-10 p-0 rounded-2xl border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-[#66B21D] transition-all active:scale-95"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="rounded-xl px-4 py-2 font-bold text-[10px] uppercase tracking-widest bg-slate-900">
                    Lihat Detail
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
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
