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

      <AddServiceDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
