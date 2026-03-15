import { ServiceListTable } from "@/components/dashboard/service-list-table"
import { db } from "@/lib/db"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { History as HistoryIcon } from "lucide-react"
import { Pagination } from "@/components/pagination"

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  const skip = (currentPage - 1) * pageSize

  const whereClause = {
    status_servis: {
      in: ["Selesai (Garansi Aktif)", "Selesai", "Dibatalkan"],
    },
  }

  const [services, totalCount] = await Promise.all([
    db.services.findMany({
      where: whereClause,
      include: {
        customer: true,
        teknisi: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),
    db.services.count({ where: whereClause })
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <HistoryIcon className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-black text-slate-500 uppercase tracking-widest">Arsip</h1>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">History Selesai</h2>
          <DynamicBreadcrumbs />
          <p className="text-slate-500 font-bold text-sm mt-1">Daftar semua pesanan servis yang telah selesai atau dibatalkan.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="p-1">
          <ServiceListTable data={services} />
        </div>
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 bg-slate-50/20">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/dashboard/history"
            />
          </div>
        )}
      </div>
    </div>
  )
}
