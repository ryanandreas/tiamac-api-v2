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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Prisma } from "@prisma/client"
import { updateJadwal } from "@/app/actions/jadwal"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarDays } from "lucide-react"

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
  const [open, setOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<BaseService | null>(null)
  const [selectedTeknisi, setSelectedTeknisi] = useState<string | undefined>()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>("09:00")
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const selectClassName =
    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

  const inputClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

  const handleScheduleClick = (service: BaseService) => {
    setSelectedService(service)
    setSelectedTeknisi(undefined)
    setSelectedDate(undefined)
    setSelectedTime("09:00")
    setDatePickerOpen(false)
    setOpen(true)
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

  const serviceJadwalRequest = selectedService
    ? extractLine(selectedService.keluhan ?? "", "Jadwal:") ?? "-"
    : "-"

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
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-8">Customer</TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Teknisi</TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tanggal</TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</TableHead>
              <TableHead className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right pr-8">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className="border-slate-50 group hover:bg-slate-50/30 transition-colors">
                <TableCell className="pl-8 py-6">
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
                <TableCell className="py-6 text-center">
                  <Badge className="px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border-none bg-orange-100 text-orange-600">
                    {item.status_servis}
                  </Badge>
                </TableCell>
                <TableCell className="py-6 pr-8 text-right">
                  <Button 
                    onClick={() => handleScheduleClick(item)}
                    className="h-9 px-4 rounded-xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20 transition-all active:scale-95"
                  >
                    Jadwalkan
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
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
        <DialogContent className="w-[95vw] sm:max-w-5xl lg:max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Jadwalkan Perbaikan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead colSpan={2}>Detail Servis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="w-[180px] text-muted-foreground">Customer</TableCell>
                      <TableCell>{selectedService?.customer?.name ?? "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Email</TableCell>
                      <TableCell>{selectedService?.customer?.email ?? "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Alamat</TableCell>
                      <TableCell>{serviceAlamat}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Keluhan</TableCell>
                      <TableCell className="whitespace-normal">{serviceKeluhanSingkat}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Request Jadwal</TableCell>
                      <TableCell>{serviceJadwalRequest}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Total Estimasi</TableCell>
                      <TableCell>Rp {estimasiTotal.toLocaleString("id-ID")}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rincian Servis</TableHead>
                      <TableHead className="w-[120px]">PK</TableHead>
                      <TableHead className="w-[140px] text-right">Harga</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Biaya Kunjungan & Diagnosa</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-right">Rp {biayaKunjungan.toLocaleString("id-ID")}</TableCell>
                    </TableRow>
                    {layananRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-normal">{row.deskripsi}</TableCell>
                        <TableCell>{row.pk} PK</TableCell>
                        <TableCell className="text-right">Rp {row.harga.toLocaleString("id-ID")}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="text-right font-medium" colSpan={2}>
                        Total layanan
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rp {layananTotal.toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-md border p-4 space-y-4">
                <div className="text-sm font-medium">Penjadwalan</div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Teknisi</div>
                  <select
                    className={cn(selectClassName)}
                    value={selectedTeknisi ?? ""}
                    onChange={(event) => setSelectedTeknisi(event.target.value || undefined)}
                  >
                    <option value="" disabled>
                      Pilih Teknisi
                    </option>
                    {teknisi.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Tanggal Perbaikan</div>
                  <DropdownMenu open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {selectedDate ? selectedDate.toISOString().slice(0, 10) : "Pilih tanggal"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(next) => {
                          setSelectedDate(next)
                          if (next) setDatePickerOpen(false)
                        }}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Jam</div>
                  <input
                    type="time"
                    className={inputClassName}
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  Jadwal terpilih:{" "}
                  {selectedDate ? `${selectedDate.toISOString().slice(0, 10)} ${selectedTime}` : "-"}
                </div>

                <Button
                  className="w-full"
                  onClick={handleSaveChanges}
                  disabled={!selectedService || !selectedTeknisi || !selectedDate || !selectedTime}
                >
                  Simpan Jadwal
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
