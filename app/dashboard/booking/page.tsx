import { ServiceListTable } from "@/components/dashboard/service-list-table"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const services = await db.services.findMany({
    where: {
      status_servis: "Booking"
    },
    include: {
      customer: true,
      teknisi: true,
      acUnits: {
        include: {
          layanan: true
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Booking</h1>
          <DynamicBreadcrumbs />
          <p className="text-slate-500 font-bold text-sm mt-1">Kelola daftar pesanan baru yang perlu segera dijadwalkan.</p>
        </div>
        <Button className="h-11 px-6 rounded-2xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-xs shadow-lg shadow-green-500/20 gap-2 transition-all">
          <Plus className="h-4 w-4" /> Tambah Pesanan
        </Button>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="p-1">
          <ServiceListTable data={services} />
        </div>
      </div>
    </div>
  )
}
