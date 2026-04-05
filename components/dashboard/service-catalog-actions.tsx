"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { EditServiceDialog } from "./edit-service-dialog"
import { DeleteServiceConfirmDialog } from "./delete-service-confirm-dialog"

interface ServiceCatalogActionsProps {
  service: {
    uuid: string
    nama: string
    pk: string | null
    harga: number
  }
}

export function ServiceCatalogActions({ service }: ServiceCatalogActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setEditOpen(true)}
          className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-[#66B21D] hover:border-green-100 hover:bg-green-50 transition-all"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setDeleteOpen(true)}
          className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <EditServiceDialog 
        open={editOpen} 
        onOpenChange={setEditOpen} 
        service={service} 
      />
      
      <DeleteServiceConfirmDialog 
        open={deleteOpen} 
        onOpenChange={setDeleteOpen} 
        service={service} 
      />
    </>
  )
}
