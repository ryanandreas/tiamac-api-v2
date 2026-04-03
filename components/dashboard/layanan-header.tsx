"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { AddServiceDialog } from "./add-service-dialog"

export function LayananHeader({ isTechnician }: { isTechnician: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Layanan & Harga</h1>
            <p className="text-slate-500 font-medium text-base">Atur daftar jasa servis AC dan penyesuaian harga terbaru.</p>
          </div>
        </div>
        {!isTechnician && (
          <Button 
            onClick={() => setOpen(true)}
            className="h-11 px-6 rounded-xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-bold text-xs border-none shadow-none gap-2 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Tambah Layanan Baru
          </Button>
        )}
      </div>

      <div className="p-6 flex flex-col md:flex-row md:items-center gap-4 bg-white">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors pointer-events-none" />
          <Input
            placeholder="Cari nama layanan..."
            className="pl-10 h-10 text-sm font-medium border-slate-100 rounded-xl focus-visible:ring-[#66B21D] shadow-none bg-slate-50/50 placeholder:text-slate-300"
          />
        </div>
      </div>

      <AddServiceDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
