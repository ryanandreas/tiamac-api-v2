"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, History, KeyRound, MoreHorizontal } from "lucide-react"
import { EditUserDialog } from "./edit-user-dialog"
import { DeleteUserConfirmDialog } from "./delete-user-confirm-dialog"
import { UserActivityDialog } from "./user-activity-dialog"
import { ResetPasswordDialog } from "./reset-password-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserActionsProps {
  type?: "staff" | "customer"
  user: {
    id: string
    name: string
    email: string
    status: string
    staffProfile?: {
      role: string
      no_telp: string | null
      wilayah: string | null
      bio: string | null
    } | null
    customerProfile?: {
      no_telp: string | null
      alamat: string | null
      provinsi: string | null
    } | null
  }
}

export function UserActions({ user, type = "staff" }: UserActionsProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          title="Edit Profil"
          className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-[#66B21D] hover:border-green-100 hover:bg-green-50 transition-all shadow-none h-8 w-8"
          onClick={() => setShowEdit(true)}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          title={type === "staff" ? "Hapus Staff" : "Hapus Pelanggan"}
          className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-none h-8 w-8"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              title="Menu Lainnya"
              className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 hover:bg-slate-50 transition-all shadow-none h-8 w-8"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-slate-100 shadow-xl shadow-slate-200/50 p-1.5 pt-1.5 pb-1.5">
             <DropdownMenuItem 
               onClick={() => setShowActivity(true)}
               className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 focus:bg-slate-50 cursor-pointer h-9 px-3"
             >
                <History className="h-3.5 w-3.5" /> Aktifitas
             </DropdownMenuItem>
             <DropdownMenuItem 
               onClick={() => setShowResetPassword(true)}
               className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-600 focus:bg-amber-50 cursor-pointer h-9 px-3"
             >
                <KeyRound className="h-3.5 w-3.5" /> Reset Pass
             </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showEdit && (
        <EditUserDialog
          user={user as any}
          type={type}
          open={showEdit}
          onOpenChange={setShowEdit}
        />
      )}

      {showDelete && (
        <DeleteUserConfirmDialog
          user={{ id: user.id, name: user.name, email: user.email }}
          type={type}
          open={showDelete}
          onOpenChange={setShowDelete}
        />
      )}

      {showResetPassword && (
        <ResetPasswordDialog
          user={{ id: user.id, name: user.name, email: user.email }}
          open={showResetPassword}
          onOpenChange={setShowResetPassword}
        />
      )}

      {showActivity && (
        <UserActivityDialog
          user={{ id: user.id, name: user.name }}
          open={showActivity}
          onOpenChange={setShowActivity}
        />
      )}
    </>
  )
}
