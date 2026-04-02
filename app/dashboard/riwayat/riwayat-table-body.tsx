'use client'

import { useState } from "react"
import { History, Eye, CheckCircle2, Clock } from "lucide-react"
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

interface RiwayatTableBodyProps {
  tasks: any[]
}

export function RiwayatTableBody({ tasks }: RiwayatTableBodyProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  const openDetail = (id: string) => {
    setSelectedServiceId(id)
    setDetailOpen(true)
  }

  return (
    <TooltipProvider>
      <TableBody>
        {tasks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-24 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-2">
                  <History className="h-6 w-6" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Belum ada riwayat pekerjaan selesai</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          tasks.map((task) => (
            <TableRow key={task.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
              <TableCell className="py-6 pl-8 font-outfit">
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#66B21D] transition-colors uppercase tracking-wider">#{task.id.slice(0, 8)}</span>
              </TableCell>
              <TableCell className="py-6 font-outfit">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{task.customer?.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Identitas Member</span>
                </div>
              </TableCell>
              <TableCell className="py-6 font-outfit">
                <Badge variant="outline" className="h-5 px-2 text-[9px] font-bold uppercase tracking-widest border-slate-100 bg-slate-50 text-slate-500 rounded-lg">
                  {task.jenis_servis}
                </Badge>
              </TableCell>
              <TableCell className="py-6 text-center font-outfit">
                {task.status_servis === "Selesai (Garansi Aktif)" ? (
                  <div className="flex items-center justify-center gap-1.5 text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Selesai</span>
                  </div>
                ) : (
                  <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg whitespace-nowrap bg-blue-50 text-blue-600 border-none">
                    {task.status_servis}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="py-6 font-outfit">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-[11px] font-bold text-slate-600 uppercase">
                    {new Date(task.updatedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right py-6 pr-8 font-outfit">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost"
                      onClick={() => openDetail(task.id)}
                      className="h-10 w-10 p-0 rounded-2xl border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-[#66B21D] transition-all active:scale-95"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="rounded-xl px-4 py-2 font-bold text-[10px] uppercase tracking-widest bg-slate-900 border-none">
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
      />
    </TooltipProvider>
  )
}
