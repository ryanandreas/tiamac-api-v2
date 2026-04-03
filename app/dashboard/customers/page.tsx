import { UserListTable } from "@/components/dashboard/user-list-table"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { User, UserIcon, Plus } from "lucide-react"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"

export default async function CustomerListPage() {
  const customers = await db.customerProfile.findMany({
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } },
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Data Pelanggan</h1>
            <p className="text-slate-500 font-medium text-base">Kelola informasi profil dan riwayat aktivitas para pelanggan Anda.</p>
          </div>
        </div>
        <Button className="h-11 px-6 rounded-xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-bold text-xs border-none shadow-none gap-2 transition-all active:scale-95">
          <Plus className="h-4 w-4" /> Tambah Customer
        </Button>
      </div>

      <div className="bg-white rounded-2xl border-0 shadow-none overflow-hidden">
        <UserListTable data={customers} type="customer" />
      </div>
    </div>
  )
}
