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
import { deleteStaffUser } from "@/app/actions/admin-actions"
import { useRouter } from "next/navigation"
import { Trash2, AlertTriangle, Loader2, UserX } from "lucide-react"
import { cn } from "@/lib/utils"
import { triggerLayananAlert } from "./layanan-alert-handler"

interface DeleteUserConfirmDialogProps {
  type?: "staff" | "customer"
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: string
    name: string
    email: string
  }
}

export function DeleteUserConfirmDialog({
  type = "staff",
  open,
  onOpenChange,
  user,
}: DeleteUserConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await deleteStaffUser(user.id)
      if (res?.success) {
        onOpenChange(false)
        router.refresh()
        triggerLayananAlert(`Akun ${user.name} berhasil dihapus`)
      } else {
        triggerLayananAlert(res?.message || "Gagal menghapus akun", "error")
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
        <div className="bg-rose-50 px-8 py-10 flex flex-col items-center border-b border-rose-100">
          <div className="size-16 rounded-3xl bg-white text-rose-500 flex items-center justify-center mb-6 shadow-xl shadow-rose-200/50">
            <UserX className="size-8" />
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              Hapus Akses {type === "staff" ? "Staff" : "Pelanggan"}?
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-2 px-4 leading-relaxed">
              Tindakan ini permanen. Akun <span className="font-bold text-rose-600 block mt-1">{user.name} ({user.email})</span> tidak akan bisa lagi mengakses dashboard.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 flex flex-col gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-12 rounded-xl font-bold text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            Batal, Simpan {type === "staff" ? "Staff" : "Pelanggan"}
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className={cn(
              "h-14 rounded-xl font-bold text-xs text-white shadow-xl transition-all active:scale-95 group",
              loading ? "bg-slate-100 text-slate-400" : "bg-rose-500 hover:bg-rose-600 shadow-rose-100"
            )}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Menghapus...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="size-4 group-hover:shake" /> Hapus Akun Permanen
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
