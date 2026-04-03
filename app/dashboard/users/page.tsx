import { UserListTable } from "@/components/dashboard/user-list-table"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { User, Plus } from "lucide-react"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Card } from "@/components/ui/card"

export default async function StaffListPage() {
  const users = await db.staffProfile.findMany({
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } },
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Daftar Staff & Teknisi</h1>
            <p className="text-slate-500 font-medium text-base">Kelola hak akses dan informasi profil karyawan Anda.</p>
          </div>
        </div>
        <Button className="h-11 px-6 rounded-xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-bold text-xs border-none shadow-none gap-2 transition-all active:scale-95">
          <Plus className="h-4 w-4" /> Tambah Staff
        </Button>
      </div>

      {/* Wrapping the UserListTable in a Card for minimalist style, removing heavy shadows and adding rounded-2xl */}
      <Card className="border-0 shadow-none overflow-hidden bg-white rounded-2xl">
        <UserListTable data={users} type="staff" />
      </Card>
    </div>
  )
}
