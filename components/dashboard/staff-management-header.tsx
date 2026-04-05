"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { AddUserDialog } from "@/components/dashboard/add-user-dialog"

export function StaffManagementHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Daftar Staff & Teknisi</h1>
            <p className="text-slate-500 font-medium text-base">Kelola hak akses dan informasi profil teknisi Anda.</p>
          </div>
        </div>
        <Button 
          onClick={() => setOpen(true)}
          className="h-11 px-6 rounded-xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-bold text-xs border-none shadow-none gap-2 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Tambah Staff
        </Button>
      </div>
      
      <AddUserDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
