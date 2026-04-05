"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, History } from "lucide-react"
import { EditUserDialog } from "./edit-user-dialog"
import { DeleteUserConfirmDialog } from "./delete-user-confirm-dialog"
import { UserActivityDialog } from "./user-activity-dialog"

interface UserActionsProps {
  user: {
    id: string
    name: string
    email: string
    status: string
    staffProfile: {
      role: string
      no_telp: string | null
      wilayah: string | null
      bio: string | null
    } | null
  }
}

export function UserActions({ user }: UserActionsProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showActivity, setShowActivity] = useState(false)

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          title="Lihat Aktifitas"
          className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 hover:bg-slate-50 transition-all shadow-none h-8 w-8"
          onClick={() => setShowActivity(true)}
        >
          <History className="h-3.5 w-3.5" />
        </Button>
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
          title="Hapus Staff"
          className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-none h-8 w-8"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {showEdit && (
        <EditUserDialog
          user={user}
          open={showEdit}
          onOpenChange={setShowEdit}
        />
      )}

      {showDelete && (
        <DeleteUserConfirmDialog
          user={{ id: user.id, name: user.name, email: user.email }}
          open={showDelete}
          onOpenChange={setShowDelete}
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
