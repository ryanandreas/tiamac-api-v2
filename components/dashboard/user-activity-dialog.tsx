"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getStaffActivity } from "@/app/actions/admin-actions"
import { History, Loader2, Package, Wrench, Boxes, CalendarDays, ChevronRight, Activity } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ActivityItem {
  type: "SERVICE" | "INVENTORY" | "MATERIAL"
  title: string
  subtitle: string
  date: Date
}

interface UserActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: string
    name: string
  }
}

export function UserActivityDialog({
  open,
  onOpenChange,
  user,
}: UserActivityDialogProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      async function fetchActivity() {
        setLoading(true)
        try {
          const res = await getStaffActivity(user.id)
          if (res?.success) {
            setActivities(res.data)
          }
        } catch (error) {
          console.error("Gagal memuat aktivitas:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchActivity()
    }
  }, [open, user.id])

  const getIcon = (type: string) => {
    switch (type) {
      case "SERVICE": return <Wrench className="size-4" />
      case "INVENTORY": return <Boxes className="size-4" />
      case "MATERIAL": return <Package className="size-4" />
      default: return <History className="size-4" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case "SERVICE": return "bg-blue-50 text-blue-600 border-blue-100"
      case "INVENTORY": return "bg-amber-50 text-amber-600 border-amber-100"
      case "MATERIAL": return "bg-[#66B21D]/10 text-[#66B21D] border-green-100"
      default: return "bg-slate-50 text-slate-600 border-slate-100"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
        <div className="bg-slate-50 px-8 py-8 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
             <History className="size-32" />
          </div>
          <DialogHeader className="relative z-10">
            <div className="size-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4 shadow-lg shadow-slate-200">
               <History className="size-6" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Aktifitas Pengguna</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
              Catatan riwayat pekerjaan atau pemesanan oleh <span className="font-bold text-slate-900">{user.name}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[500px] overflow-y-auto w-full">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="size-8 animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest">Memuat Log...</p>
            </div>
          ) : activities.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {activities.map((act, i) => (
                <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors flex items-start gap-4 group">
                  <div className={cn(
                    "size-10 rounded-xl border flex items-center justify-center shrink-0 transition-all group-hover:scale-110",
                    getColor(act.type)
                  )}>
                    {getIcon(act.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-slate-900 leading-tight">{act.title}</p>
                    <p className="text-xs font-medium text-slate-500">{act.subtitle}</p>
                    <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      <CalendarDays className="size-3" />
                      {format(new Date(act.date), "dd MMM yyyy HH:mm", { locale: id })}
                    </div>
                  </div>
                  <div className="size-8 rounded-full flex items-center justify-center text-slate-200 opacity-0 group-hover:opacity-100 transition-all">
                    <ChevronRight className="size-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-300">
              <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center">
                 <Activity className="size-8 opacity-20" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">Belum ada aktifitas</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl font-bold text-xs border-slate-200 text-slate-500 hover:bg-white transition-all shadow-none"
          >
            Tutup Dialog
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
