"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Prisma } from "@prisma/client"
import { updateJadwal } from "@/app/actions/jadwal"
import { deleteService } from "@/app/actions/admin-actions"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { 
  CalendarDays, 
  Eye, 
  Trash2, 
  X, 
  Wrench, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Receipt,
  User,
  ShieldCheck,
  Calendar as CalendarIcon
} from "lucide-react"
import { ServiceStatusHistoryDialog } from "./service-status-history-dialog"
import { useRouter } from "next/navigation"

type BaseService = Prisma.ServicesGetPayload<{
  include: {
    customer: { include: { customerProfile: true } }
    teknisi: true
    acUnits: { include: { layanan: true } }
  }
}>

type Technician = { id: string; name: string }

interface SchedulingTableProps {
  data: BaseService[]
  teknisi: Technician[]
}

export function SchedulingTable({ data, teknisi }: SchedulingTableProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<BaseService | null>(null)
  const [selectedTeknisi, setSelectedTeknisi] = useState<string | undefined>()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>("09:00")
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedDetailServiceId, setSelectedDetailServiceId] = useState<string | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)

  const selectClassName =
    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

  const inputClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

  const handleScheduleClick = (service: BaseService) => {
    setSelectedService(service)
    setSelectedTeknisi(service.teknisiId || undefined)

    // Pre-fill Date and Time from customer request
    const jadwalStr = extractLine(service.keluhan ?? "", "Jadwal:")
    if (jadwalStr) {
      const parts = jadwalStr.split(",").map((p) => p.trim())
      if (parts.length >= 1) {
        const parsedDate = new Date(parts[0])
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate)
        }
      }
      if (parts.length >= 2) {
        const timeStr = parts[1]
        if (/^\d{2}:\d{2}$/.test(timeStr)) {
          setSelectedTime(timeStr)
        }
      }
    } else {
      setSelectedDate(undefined)
      setSelectedTime("09:00")
    }

    setDatePickerOpen(false)
    setOpen(true)
  }

  const openDetail = (serviceId: string) => {
    setSelectedDetailServiceId(serviceId)
    setDetailOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return
    setActionBusy(true)
    try {
      const res = await deleteService(serviceToDelete)
      if (res?.success) {
        alert(res.message)
        setDeleteDialogOpen(false)
        router.refresh()
      } else {
        alert(res?.message || "Gagal menghapus pesanan")
      }
    } finally {
      setActionBusy(false)
    }
  }

  function extractLine(keluhan: string, prefix: string) {
    const lines = keluhan.split("\n")
    const line = lines.find((l) => l.trim().toLowerCase().startsWith(prefix.toLowerCase()))
    if (!line) return undefined
    return line.replace(new RegExp(`^${prefix}\\s*`, "i"), "").trim()
  }

  const serviceAlamat = selectedService
    ? extractLine(selectedService.keluhan ?? "", "Alamat:") ??
      selectedService.customer?.customerProfile?.alamat ??
      "-"
    : "-"

  const serviceJadwalRaw = selectedService ? extractLine(selectedService.keluhan ?? "", "Jadwal:") : undefined
  const serviceJadwalRequest = (() => {
    if (!serviceJadwalRaw) return "-"
    try {
      const parts = serviceJadwalRaw.split(",").map(p => p.trim())
      const datePart = parts[0]
      const timePart = parts[1] || ""

      const dateObj = new Date(datePart)
      if (isNaN(dateObj.getTime())) return serviceJadwalRaw

      const formattedDate = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(dateObj)

      return `${formattedDate}${timePart ? `, ${timePart}` : ""}`
    } catch (e) {
      return serviceJadwalRaw
    }
  })()

  const serviceKeluhanSingkat = selectedService
    ? (selectedService.keluhan ?? "").split("\n").find((l) => l.trim()) ?? "-"
    : "-"

  const biayaKunjungan = selectedService?.biaya_dasar ?? 50000
  const layananRows =
    selectedService?.acUnits.flatMap((unit, unitIdx) =>
      unit.layanan.map((layanan) => ({
        id: layanan.id,
        deskripsi: `AC ${unitIdx + 1} - ${layanan.nama}`,
        pk: unit.pk,
        harga: layanan.harga,
      }))
    ) ?? []

  const layananTotal = layananRows.reduce((sum, r) => sum + r.harga, 0)
  const estimasiTotal = selectedService?.estimasi_biaya ?? biayaKunjungan + layananTotal

  const handleSaveChanges = async () => {
    if (selectedService && selectedTeknisi && selectedDate && selectedTime) {
      const jadwalTanggal = `${selectedDate.toISOString().slice(0, 10)} ${selectedTime}`
      await updateJadwal(selectedService.id, selectedTeknisi, jadwalTanggal)
      setOpen(false)
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/30">
            <TableRow className="border-slate-50 hover:bg-transparent">
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-8">Order ID</TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Teknisi</TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tanggal</TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right pr-8">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className="border-slate-50 group hover:bg-slate-50/30 transition-colors">
                <TableCell className="pl-8 py-6">
                  <span className="text-xs font-black text-slate-400 tracking-wider">
                    #{item.id.slice(-8).toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] shrink-0 overflow-hidden">
                       {item.customer?.name?.slice(0, 2).toUpperCase() || "CS"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-sm text-slate-900 group-hover:text-[#66B21D] transition-colors truncate">{item.customer?.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 truncate">{item.customer?.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  {item.teknisi ? (
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-green-50 flex items-center justify-center text-[#66B21D] font-black text-[10px] shrink-0 overflow-hidden">
                        {item.teknisi.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-sm text-slate-900 truncate">{item.teknisi.name}</span>
                        <span className="text-[10px] font-bold text-[#66B21D] uppercase tracking-widest">Technician</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-300 italic">
                      <div className="size-8 rounded-lg border border-dashed border-slate-200" />
                      <span className="text-xs font-bold">Unassigned</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(item.createdAt).getFullYear()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <Badge className="px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border-none bg-orange-100 text-orange-600">
                    {item.status_servis}
                  </Badge>
                </TableCell>
                <TableCell className="py-6 pr-8">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      onClick={() => handleScheduleClick(item)}
                      className="h-8 px-3 rounded-lg bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-[9px] uppercase tracking-widest shadow-none transition-all active:scale-95"
                    >
                      Jadwalkan
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => openDetail(item.id)}
                      className="h-8 w-8 rounded-lg border-slate-100 text-slate-400 hover:text-[#66B21D] hover:border-green-100 hover:bg-green-50 transition-all shadow-none"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDeleteClick(item.id)}
                      className="h-8 w-8 rounded-xl border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-none"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 mb-2">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tidak ada pesanan untuk dijadwalkan</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[1350px] w-full p-0 overflow-hidden border-none rounded-[32px] shadow-2xl bg-[#F8FAFC] focus:outline-none">
          <DialogTitle className="sr-only">Jadwalkan Perbaikan</DialogTitle>
          <DialogDescription className="sr-only">Formulir untuk menentukan teknisi, tanggal, dan jam perbaikan untuk pesanan ini.</DialogDescription>
          {selectedService && (
            <div className="flex flex-col h-screen max-h-[90vh] bg-[#F8FAFC] font-sans">
              {/* Header Redesign (Sticky) */}
              <div className="p-8 pb-5 border-b border-[#F1F5F9] bg-white z-20 shrink-0">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-[24px] font-[800] text-[#0F172A] leading-[32px] tracking-tight font-display mb-1">
                      Jadwalkan Perbaikan
                    </h1>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-[600] text-[#64748B] tracking-wide">ORDER</span>
                      <span className="text-sm font-[800] text-[#0F172A]">#{selectedService.id?.slice(-8).toUpperCase()}</span>
                      <div className="size-1 rounded-full bg-[#CBD5E1]" />
                      <span className="text-sm font-[600] text-[#66B21D]">{selectedService.status_servis}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="ghost" 
                      onClick={() => setOpen(false)} 
                      className="size-10 p-0 rounded-xl bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] transition-all shrink-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Decorative Line */}
                <div className="w-full h-1 bg-[#CBD5E1]/30 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-[#66B21D] shadow-[0_0_8px_rgba(102,178,29,0.4)]" />
                </div>
              </div>

              {/* Scrollable Content Wrapper */}
              <div 
                data-lenis-prevent
                className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-8"
              >
                {/* Triple Info Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Pelanggan */}
                  <div className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-[20px] p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="size-11 rounded-[16px] bg-[#66B21D]/10 flex items-center justify-center text-[#66B21D] shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-[700] text-[#94A3B8] uppercase tracking-[0.12em] mb-0.5">Pelanggan</p>
                      <p className="text-sm font-[800] text-[#1E293B] truncate">{selectedService.customer?.name}</p>
                    </div>
                  </div>

                  {/* Request Jadwal */}
                  <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[20px] p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="size-11 rounded-[16px] bg-white flex items-center justify-center text-[#166534] shrink-0">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-[700] text-[#166534]/60 uppercase tracking-[0.12em] mb-0.5">Request Customer</p>
                      <p className="text-sm font-[800] text-[#166534] truncate">{serviceJadwalRequest}</p>
                    </div>
                  </div>

                  {/* Lokasi */}
                  <div className="flex items-center gap-3 bg-[#FFF7ED] border border-[#FFEDD5] rounded-[20px] p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="size-11 rounded-[16px] bg-white flex items-center justify-center text-[#9A3412] shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-[700] text-[#94A3B8] uppercase tracking-[0.12em] mb-0.5 whitespace-nowrap">Lokasi Perbaikan</p>
                      <p className="text-sm font-[800] text-[#1E293B] truncate">{serviceAlamat}</p>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                  {/* Left: Detail Services */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[18px] font-[800] text-[#0F172A] leading-[22px]">Rincian Jasa & Unit AC</h2>
                        <div className="bg-[#F1F5F9] rounded-full px-3 py-1.5">
                          <span className="text-[10px] font-[800] text-[#475569] uppercase tracking-[0.1em]">Estimasi Biaya</span>
                        </div>
                      </div>

                      <div className="border border-[#F1F5F9] rounded-[20px] overflow-hidden shadow-sm">
                        {/* Table Header */}
                        <div className="grid grid-cols-10 bg-[#F8FAFC] border-b border-[#F1F5F9] p-4">
                          <div className="col-span-6 text-[11px] font-[800] text-[#94A3B8] uppercase">Pekerjaan</div>
                          <div className="col-span-1 text-[11px] font-[800] text-[#94A3B8] uppercase text-center">PK</div>
                          <div className="col-span-3 text-[11px] font-[800] text-[#94A3B8] uppercase text-right">Harga</div>
                        </div>

                        {/* Visit Fee */}
                        <div className="grid grid-cols-10 items-center p-4 border-b border-[#F8FAFC] hover:bg-slate-50/30 transition-colors">
                          <div className="col-span-6">
                            <p className="text-sm font-[700] text-[#334155]">Biaya Kunjungan & Pemeriksaan</p>
                          </div>
                          <div className="col-span-1 text-sm font-[600] text-[#64748B] text-center">-</div>
                          <div className="col-span-3 text-sm font-[800] text-[#0F172A] text-right">Rp {biayaKunjungan.toLocaleString('id-ID')}</div>
                        </div>

                        {/* Service Items */}
                        {layananRows.map((row) => (
                          <div key={row.id} className="grid grid-cols-10 items-center p-4 border-b border-[#F8FAFC] hover:bg-[#66B21D]/5 transition-colors">
                            <div className="col-span-6">
                              <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-[#66B21D]" />
                                <p className="text-sm font-[700] text-[#334155]">{row.deskripsi}</p>
                              </div>
                            </div>
                            <div className="col-span-1 text-sm font-[600] text-[#64748B] text-center">{row.pk}</div>
                            <div className="col-span-3 text-sm font-[800] text-[#0F172A] text-right">Rp {row.harga.toLocaleString('id-ID')}</div>
                          </div>
                        ))}

                        {/* Total Estimasi Row */}
                        <div className="grid grid-cols-10 items-center bg-[#F1F5F9]/50 p-5">
                          <div className="col-span-7 pr-4">
                             <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-2.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-[#166534]" />
                                <p className="text-[11px] font-bold text-[#166534]">Setiap pesanan di TIAMAC dilindungi garansi servis 30 hari.</p>
                             </div>
                          </div>
                          <div className="col-span-3">
                             <p className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-[0.1em] text-right mb-0.5">Total</p>
                             <p className="text-xl font-[900] text-[#0F172A] text-right tracking-tight">Rp {estimasiTotal.toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Scheduling Config */}
                  <div className="lg:col-span-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-sm">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="size-9 rounded-xl bg-[#66B21D]/10 flex items-center justify-center text-[#66B21D]">
                           <Clock className="h-4.5 w-4.5" />
                        </div>
                        <h2 className="text-[18px] font-[800] text-[#0F172A]">Konfigurasi</h2>
                      </div>

                      <div className="space-y-6">
                        {/* Teknisi Select */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-[0.12em] ml-1">Pilih Teknisi</label>
                          <Select
                            value={selectedTeknisi ?? ""}
                            onValueChange={(value) => setSelectedTeknisi(value)}
                          >
                            <SelectTrigger className="flex !h-12 w-full items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 !py-0 text-sm font-semibold text-slate-700 hover:border-[#66B21D]/30 focus:border-[#66B21D] focus:ring-[#66B21D]/10 transition-all outline-none group">
                              <div className="flex items-center gap-2.5">
                                <Wrench className="size-4 text-[#CBD5E1] group-focus:text-[#66B21D] transition-colors" />
                                <SelectValue placeholder="Pilih Teknisi" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-[#E2E8F0] shadow-2xl p-1">
                              {teknisi.map((t) => (
                                <SelectItem 
                                  key={t.id} 
                                  value={t.id}
                                  className="rounded-xl font-semibold text-slate-600 focus:bg-[#66B21D]/5 focus:text-[#66B21D] py-2.5"
                                >
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date Picker */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-[0.12em] ml-1">Tanggal</label>
                          <DropdownMenu open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 rounded-xl border-[#E2E8F0] bg-[#F8FAFC] justify-start text-left font-semibold px-4 hover:bg-white hover:border-[#66B21D]/30 transition-all group text-sm"
                              >
                                <CalendarIcon className="mr-2.5 h-4 w-4 text-[#CBD5E1] group-hover:text-[#66B21D]" />
                                {selectedDate ? selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : <span className="text-slate-400">Pilih Tanggal</span>}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-auto p-0 rounded-2xl overflow-hidden border-[#E2E8F0] shadow-2xl">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(next) => {
                                  setSelectedDate(next)
                                  if (next) setDatePickerOpen(false)
                                }}
                                className="p-3"
                              />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Time Input */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-[800] text-[#94A3B8] uppercase tracking-[0.12em] ml-1">Waktu</label>
                          <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#CBD5E1] group-focus-within:text-[#66B21D] transition-colors z-10" />
                            <input
                              type="time"
                              className="w-full h-12 pl-10.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-slate-700 hover:border-[#66B21D]/30 focus:border-[#66B21D] focus:ring-[#66B21D]/10 transition-all text-sm outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                              value={selectedTime}
                              onChange={(e) => setSelectedTime(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Summary Info */}
                        {selectedDate && selectedTeknisi && (
                          <div className="p-4 rounded-[20px] bg-[#F0FDF4] border border-[#DCFCE7] animate-in fade-in zoom-in duration-500">
                             <div className="flex items-center gap-2 mb-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#166534]" />
                                <span className="text-[9px] font-black text-[#166534] uppercase tracking-wider">Konfirmasi</span>
                             </div>
                             <p className="text-[11px] font-bold text-[#166534]/70 leading-relaxed">
                                Teknisi <strong>{teknisi.find(t => t.id === selectedTeknisi)?.name}</strong> dijadwalkan pada <strong>{selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</strong> pukul <strong>{selectedTime}</strong>.
                             </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-6 border-t border-[#F1F5F9] bg-white shrink-0">
                <div className="flex justify-end items-center max-w-[1000px] mx-auto px-2">
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={!selectedService || !selectedTeknisi || !selectedDate || !selectedTime}
                    className="h-11 px-8 rounded-[18px] bg-[#0F172A] hover:bg-[#1E293B] text-white font-[800] text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
                  >
                    Simpan Jadwal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Pesanan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={actionBusy}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={actionBusy}>
              {actionBusy ? "Menghapus..." : "Hapus Pesanan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ServiceStatusHistoryDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        serviceId={selectedDetailServiceId}
      />
    </>
  )
}
