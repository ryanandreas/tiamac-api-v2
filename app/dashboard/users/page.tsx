import { UserListTable } from "@/components/dashboard/user-list-table"
import { db } from "@/lib/db"
import { Users } from "lucide-react"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"

export default async function StaffListPage() {
  const users = await db.staffProfile.findMany({
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } },
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="h-4 w-4" />
          </div>
          <h1 className="text-sm font-black text-blue-600 uppercase tracking-widest">Manajemen SDM</h1>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Daftar Staff & Teknisi</h2>
        <DynamicBreadcrumbs />
        <p className="text-slate-500 font-bold text-sm mt-1">Kelola hak akses dan informasi profil karyawan Anda.</p>
      </div>

      <UserListTable data={users} type="staff" />
    </div>
  )
}
