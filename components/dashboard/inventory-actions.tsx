"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { EditInventoryDialog } from "./edit-inventory-dialog"
import { DeleteInventoryConfirmDialog } from "./delete-inventory-confirm-dialog"

interface InventoryActionsProps {
  item: {
    id: string
    sku: string
    nama: string
    uom: string
    harga: number
    qtyOnHand: number
    minStock: number | null
  }
}

export function InventoryActions({ item }: InventoryActionsProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all shadow-none h-8 w-8"
          onClick={() => setShowEdit(true)}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-none h-8 w-8"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {showEdit && (
        <EditInventoryDialog
          item={item}
          open={showEdit}
          onOpenChange={setShowEdit}
        />
      )}

      {showDelete && (
        <DeleteInventoryConfirmDialog
          item={item}
          open={showDelete}
          onOpenChange={setShowDelete}
        />
      )}
    </>
  )
}
