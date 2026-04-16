"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Phone, MapPin, Calendar, Clock, Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { ServiceStatusHistoryDialog } from "@/components/dashboard/service-status-history-dialog"

function extractJadwal(keluhan: string) {
  const match = keluhan.match(/^Jadwal:\s*(.+)$/im)
  return match?.[1]?.trim()
}

function actionForStatus(status: string, serviceId: string) {
  if (status === "Perbaikan Unit") {
    return { href: `/dashboard/pengerjaan/${serviceId}`, label: "Upload Bukti", color: "bg-[#66B21D] hover:bg-[#4d9e0f]" }
  }
  if (status === "Konfirmasi Teknisi" || status === "Pengecekan Unit" || status === "Dalam Pengecekan" || status === "Menunggu Persetujuan Customer") {
    return { href: `/dashboard/pengecekan/${serviceId}`, label: "Konfirmasi", color: "bg-[#66B21D] hover:bg-[#4d9e0f]" }
  }
  return null
}

type TaskRow = {
  id: string
  jenis_servis: string
  keluhan: string
  status_servis: string
  customer: {
    name: string
    email: string | null
    customerProfile: { no_telp: string | null; alamat: string | null } | null
  }
  alamat_servis: string | null
}

export function TugasTable({
  tasks,
}: {
  tasks: TaskRow[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  const openDetail = (id: string) => {
    setSelectedServiceId(id)
    setDetailOpen(true)
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col font-outfit">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-6 px-3 text-[10px] font-black uppercase tracking-widest border-slate-100 text-slate-400 rounded-lg">
              Total: {tasks.length} Penugasan Baru
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 hover:bg-transparent h-14">
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-8">Order ID</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Informasi Pelanggan</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Waktu & Alamat</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-2">
                        <Clock className="h-6 w-6" />
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tidak ada penugasan aktif saat ini</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => {
                  const jadwal = extractJadwal(task.keluhan ?? "")
                  const action = actionForStatus(task.status_servis, task.id)

                  return (
                    <TableRow key={task.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                      <TableCell className="py-6 pl-8">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-black text-slate-900 group-hover:text-[#66B21D] transition-colors tabular-nums">#{task.id.slice(-8).toUpperCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs shrink-0 group-hover:bg-white transition-colors uppercase">
                            {task.customer.name.slice(0, 2)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-slate-900 truncate">{task.customer.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                               <Phone className="h-3 w-3 text-slate-300" />
                               <span className="text-[10px] font-bold text-slate-400 tracking-tight">{task.customer.customerProfile?.no_telp || "-"}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                         <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                               <Calendar className="h-3.5 w-3.5 text-slate-300" />
                               <span className="text-[11px] font-black text-slate-600 uppercase">{jadwal || "-"}</span>
                            </div>
                            <div className="flex items-start gap-2 max-w-[200px]">
                               <MapPin className="h-3.5 w-3.5 text-slate-300 mt-0.5 shrink-0" />
                               <span className="text-[10px] font-bold text-slate-400 line-clamp-2 leading-relaxed">{task.alamat_servis || task.customer.customerProfile?.alamat || "Alamat tidak tersedia"}</span>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell className="py-6 text-center">
                         <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg whitespace-nowrap border-none bg-blue-50 text-blue-600">
                          {task.status_servis}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-6 pr-8">
                        <div className="flex items-center justify-end gap-3">
                          {action ? (
                            <Button className={`h-10 px-5 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest gap-2.5 shadow-lg shadow-green-500/10 transition-all active:scale-95 ${action.color}`} asChild>
                              <Link href={action.href}>
                                {action.label}
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="h-10 px-5 rounded-2xl border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-300" disabled>
                              No Action
                            </Button>
                          )}

                          {/* Detail Toggle Trigger */}
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
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <ServiceStatusHistoryDialog 
          open={detailOpen}
          onOpenChange={setDetailOpen}
          serviceId={selectedServiceId}
        />
      </div>
    </TooltipProvider>
  )
}

