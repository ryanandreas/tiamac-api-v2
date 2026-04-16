"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, Check } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

interface StatusFilterProps {
  type: "ongoing" | "history"
}

export function StatusFilter({ type }: StatusFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentStatus = searchParams.get("status")

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

  const options = type === "ongoing" ? ONGOING_STATUSES : HISTORY_STATUSES

  const handleSelect = (status: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (status) {
      params.set("status", status)
    } else {
      params.delete("status")
    }
    
    // Reset to page 1 when filtering
    params.set("page", "1")

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-10 w-10 shrink-0 border-none rounded-xl transition-all relative",
            currentStatus ? "bg-green-50 text-[#66B21D]" : "bg-slate-50 text-slate-400 hover:text-[#66B21D] hover:bg-green-50"
          )}
        >
          <Filter className="h-4 w-4" />
          {currentStatus && (
            <span className="absolute top-2 right-2 size-2 bg-[#66B21D] rounded-full border-2 border-white" />
          )}
          {isPending && (
             <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
               <div className="size-3 border-2 border-[#66B21D]/30 border-t-[#66B21D] rounded-full animate-spin" />
             </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-xl">
        <DropdownMenuLabel className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-widest">Filter Status</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-50 mx-2" />
        <DropdownMenuItem 
          onClick={() => handleSelect(null)}
          className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 focus:bg-green-50 focus:text-[#66B21D] cursor-pointer gap-2"
        >
          <div className="size-4 shrink-0">
            {!currentStatus && <Check className="h-4 w-4" />}
          </div>
          Semua Status
        </DropdownMenuItem>
        {options.map((status) => (
          <DropdownMenuItem 
            key={status}
            onClick={() => handleSelect(status)}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 focus:bg-green-50 focus:text-[#66B21D] cursor-pointer gap-2"
          >
            <div className="size-4 shrink-0">
              {currentStatus === status && <Check className="h-4 w-4" />}
            </div>
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
