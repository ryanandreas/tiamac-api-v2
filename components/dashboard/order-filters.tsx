"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Filter, Check, CalendarIcon, RotateCcw, ChevronRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface OrderFiltersProps {
  type: "ongoing" | "history"
}

const ONGOING_STATUSES = [
  "Booking",
  "Menunggu Jadwal",
  "Konfirmasi Teknisi",
  "Pengecekan Unit",
  "Menunggu Persetujuan Customer",
  "Perbaikan Unit",
  "Menunggu Pembayaran",
]

const HISTORY_STATUSES = [
  "Selesai",
  "Selesai (Garansi Aktif)",
  "Dibatalkan",
]

export function OrderFilters({ type }: OrderFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(false)

  const currentStatus = searchParams.get("status")
  const currentDateParam = searchParams.get("date")
  const date = currentDateParam ? parseISO(currentDateParam) : undefined

  const options = type === "ongoing" ? ONGOING_STATUSES : HISTORY_STATUSES
  const hasActiveFilters = !!currentStatus || !!currentDateParam

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams)
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    updateFilters({ status: value === "all" ? null : value })
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      updateFilters({ date: format(selectedDate, "yyyy-MM-dd") })
    } else {
      updateFilters({ date: null })
    }
  }

  const handleReset = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("status")
    params.delete("date")
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-10 rounded-xl px-3 font-bold text-xs gap-2 transition-all border-slate-200",
            hasActiveFilters ? "bg-green-50 text-[#66B21D] border-green-100" : "bg-white text-slate-500 hover:text-[#66B21D] hover:bg-green-50"
          )}
        >
          <Filter className="h-4 w-4" />
          {hasActiveFilters && (
            <Badge className="ml-1 h-5 px-1.5 bg-[#66B21D] text-white border-none text-[10px]">
              { [currentStatus, currentDateParam].filter(Boolean).length }
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] p-0 rounded-3xl border-none shadow-2xl overflow-hidden bg-white">
        <div className="p-6 space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Filter Pesanan</h3>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Atur pencarian pengerjaan Anda</p>
          </div>

          <div className="space-y-5">
            {/* Status Dropdown (Dropdown dalam Dropdown) */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Status Pengerjaan</label>
              <Select value={currentStatus || "all"} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-11 rounded-1.5xl border-slate-100 bg-slate-50/50 font-bold text-xs text-slate-900 focus:ring-[#66B21D]/20 transition-all">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl min-w-[200px]">
                  <SelectGroup>
                    <SelectLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400">Pilih Status</SelectLabel>
                    <SelectItem value="all" className="rounded-xl font-bold text-xs">Semua Status</SelectItem>
                    {options.map((option) => (
                      <SelectItem key={option} value={option} className="rounded-xl font-bold text-xs">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker Dropdown (Dropdown dalam Dropdown) */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Tanggal Servis</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-between rounded-1.5xl border-slate-100 bg-slate-50/50 px-4 text-left font-bold text-xs transition-all",
                      !date ? "text-slate-400" : "text-slate-900"
                    )}
                  >
                    <span className="truncate">
                      {date ? format(date, "PPP") : "Pilih Tanggal"}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-slate-300" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-3xl border-none shadow-2xl overflow-hidden bg-white z-[100]" align="start">
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                      className="rounded-2xl"
                    />
                  </div>
                  {date && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDateSelect(undefined)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Hapus Pilihan Tanggal
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-50 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="text-[10px] font-bold text-slate-400 hover:text-red-500 gap-1.5 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
          <Button 
            size="sm" 
            onClick={() => setOpen(false)}
            className="h-10 px-8 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
          >
            Selesai
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
