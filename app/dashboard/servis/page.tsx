import { ServiceListTable } from "@/components/dashboard/service-list-table"
import { db } from "@/lib/db"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Truck, Search, Filter } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default async function ServisPage({
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
      in: [
        "Menunggu Jadwal",
        "Konfirmasi Teknisi",
        "Dalam Pengecekan",
        "Menunggu Persetujuan Customer",
        "Perbaikan Unit",
        "Pekerjaan Selesai",
        "Menunggu Pembayaran",
      ],
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
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Servis Berjalan</h1>
            <p className="text-slate-500 font-medium text-base">Pantau perkembangan seluruh pesanan servis yang sedang aktif.</p>
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
              baseUrl="/dashboard/servis"
            />
          </div>
        )}
      </div>
    </div>
  )
}

