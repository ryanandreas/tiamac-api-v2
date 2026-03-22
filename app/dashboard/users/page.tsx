import { UserListTable } from "@/components/dashboard/user-list-table"
import { db } from "@/lib/db"
import { Users } from "lucide-react"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Card } from "@/components/ui/card"

export default async function StaffListPage() {
  const users = await db.staffProfile.findMany({
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } },
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-4">
        <DynamicBreadcrumbs />
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Daftar Staff & Teknisi</h1>
          <p className="text-slate-500 font-medium text-base">Kelola hak akses dan informasi profil karyawan Anda.</p>
        </div>
      </div>

      {/* Wrapping the UserListTable in a Card for minimalist style, removing heavy shadows and adding rounded-2xl */}
      <Card className="border-0 shadow-none overflow-hidden bg-white rounded-2xl">
        <UserListTable data={users} type="staff" />
      </Card>
    </div>
  )
}
