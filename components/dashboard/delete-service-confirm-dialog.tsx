"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteServiceCatalog } from "@/app/actions/admin-actions"
import { useRouter } from "next/navigation"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { triggerLayananAlert } from "./layanan-alert-handler"

interface DeleteServiceConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: {
    uuid: string
    nama: string
  } | null
}

export function DeleteServiceConfirmDialog({ open, onOpenChange, service }: DeleteServiceConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!service) return
    
    setLoading(true)
    try {
      const res = await deleteServiceCatalog(service.uuid)
      if (res?.success) {
        onOpenChange(false)
        router.refresh()
        triggerLayananAlert("Layanan berhasil dihapus dari katalog")
      } else {
        triggerLayananAlert(res?.message || "Gagal menghapus layanan", "error")
      }
    } catch (error) {
      triggerLayananAlert("Terjadi kesalahan sistem", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
        <div className="bg-red-50 px-8 py-8 border-b border-red-100 flex flex-col items-center text-center">
            <div className="size-16 rounded-3xl bg-white text-red-500 flex items-center justify-center mb-4 shadow-sm">
               <AlertTriangle className="size-8" />
            </div>
            <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Hapus Layanan?</DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
                  Apakah Anda yakin ingin menghapus layanan <span className="font-bold text-red-600">"{service?.nama}"</span>? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
            </DialogHeader>
        </div>

        <div className="p-6 flex gap-3 bg-white">
            <Button 
                type="button" 
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12 rounded-xl font-bold text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all border border-slate-100"
                disabled={loading}
            >
                Batal
            </Button>
            <Button 
                onClick={handleDelete}
                disabled={loading}
                className={cn(
                    "flex-1 h-12 rounded-xl font-bold text-xs text-white shadow-xl bg-red-500 hover:bg-red-600 shadow-red-100 transition-all active:scale-95",
                    loading && "opacity-50"
                )}
            >
                {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <div className="flex items-center gap-2">
                        <Trash2 className="size-4" /> Hapus Permanen
                    </div>
                )}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
