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
      <div className="space-y-4">
        <DynamicBreadcrumbs />
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Riwayat Pekerjaan</h1>
          <p className="text-slate-500 font-medium text-base">Daftar semua pesanan servis yang telah selesai atau dibatalkan.</p>
        </div>
      </div>
      </div>

      <div className="bg-white rounded-2xl border-0 shadow-none overflow-hidden">
        <div className="p-0">
          <ServiceListTable data={services} />
        </div>
        {totalPages > 1 && (
          <div className="p-6 bg-slate-50/20">
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
