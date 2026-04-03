"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { AddInventoryDialog } from "./add-inventory-dialog"

export function InventoryHeader({ isTechnician, totalCount }: { isTechnician: boolean, totalCount: number }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Manajemen Inventory</h1>
            <p className="text-slate-500 font-medium text-base">Kelola ketersediaan sparepart dan material teknisi.</p>
          </div>
        </div>
        {!isTechnician && (
          <Button 
            onClick={() => setOpen(true)}
            className="h-11 px-6 rounded-xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-bold text-xs border-none shadow-none gap-2 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Tambah Barang Baru
          </Button>
        )}
      </div>

      <AddInventoryDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
