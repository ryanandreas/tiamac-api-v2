"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Phone, Mail, MapPin, Calendar, Clock, User } from "lucide-react"

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

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "Teknisi Dikonfirmasi", label: "Teknisi Dikonfirmasi" },
  { value: "Dalam Pengecekan", label: "Dalam Pengecekan" },
  { value: "Menunggu Persetujuan Customer", label: "Menunggu Persetujuan Customer" },
  { value: "Sedang Dikerjakan", label: "Sedang Dikerjakan" },
]

function extractJadwal(keluhan: string) {
  const match = keluhan.match(/^Jadwal:\s*(.+)$/im)
  return match?.[1]?.trim()
}

function actionForStatus(status: string, serviceId: string) {
  if (status === "Sedang Dikerjakan") {
    return { href: `/dashboard/pengerjaan/${serviceId}`, label: "Upload Bukti", color: "bg-[#66B21D] hover:bg-[#4d9e0f]" }
  }
  if (status === "Menunggu Persetujuan Customer") {
    return { href: `/dashboard/pengecekan/${serviceId}`, label: "Lihat Detail", color: "bg-amber-500 hover:bg-amber-600" }
  }
  if (status === "Dalam Pengecekan" || status === "Teknisi Dikonfirmasi") {
    return { href: `/dashboard/pengecekan/${serviceId}`, label: "Mulai Pengecekan", color: "bg-blue-600 hover:bg-blue-700" }
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
}

export function TugasTable({
  tasks,
  selectedStatus,
}: {
  tasks: TaskRow[]
  selectedStatus: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    params.set("page", "1")
    const next = params.toString()
    router.replace(`/dashboard/tugas${next ? `?${next}` : ""}`)
  }

  return (
    <div className="flex flex-col">
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-6 px-2 text-[10px] font-black uppercase tracking-widest border-slate-100 text-slate-400">
            Total: {tasks.length} Tugas
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter:</span>
          <select
            name="status"
            value={selectedStatus}
            className="h-10 rounded-xl border-slate-100 bg-slate-50 px-4 text-[11px] font-black uppercase tracking-widest focus:ring-[#66B21D] focus:bg-white transition-all outline-none"
            onChange={(event) => handleStatusChange(event.currentTarget.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/30">
            <TableRow className="border-slate-50 hover:bg-transparent">
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 pl-8">Informasi Pelanggan</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12">Detail Servis</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12">Waktu & Alamat</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 text-center">Status</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 pr-8">Aksi</TableHead>
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
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs shrink-0 group-hover:bg-white transition-colors uppercase">
                          {task.customer.name.slice(0, 2)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black text-slate-900 group-hover:text-[#66B21D] transition-colors truncate">{task.customer.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                             <Phone className="h-3 w-3 text-slate-300" />
                             <span className="text-[10px] font-bold text-slate-400">{task.customer.customerProfile?.no_telp || "-"}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit h-5 px-2 text-[9px] font-black uppercase tracking-widest border-slate-100 bg-slate-50 text-slate-500 rounded-lg">
                          {task.jenis_servis}
                        </Badge>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">ID: #{task.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                       <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             <Calendar className="h-3.5 w-3.5 text-slate-300" />
                             <span className="text-[11px] font-black text-slate-600">{jadwal || "-"}</span>
                          </div>
                          <div className="flex items-start gap-2 max-w-[200px]">
                             <MapPin className="h-3.5 w-3.5 text-slate-300 mt-0.5 shrink-0" />
                             <span className="text-[10px] font-bold text-slate-400 line-clamp-2">{task.customer.customerProfile?.alamat || "Alamat tidak tersedia"}</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                       <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap">
                        {task.status_servis}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-6 pr-8">
                      {action ? (
                        <Button className={`h-10 px-4 rounded-xl text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-green-500/10 transition-all ${action.color}`} asChild>
                          <Link href={action.href}>
                            {action.label}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-10 rounded-xl border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-300" disabled>
                          Tidak Ada Aksi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

