import type { Metadata } from "next"
import { db } from "@/lib/db"
import { Briefcase, Bell } from "lucide-react"
import { TugasTable } from "@/components/technician/tugas-table"
import { getCurrentUser } from "@/app/actions/session"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Pagination } from "@/components/pagination"


export const metadata: Metadata = {
  title: "Penugasan Baru",
}

export default async function TugasTeknisiPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const user = await getCurrentUser()
  if (
    !user.isAuthenticated ||
    user.type !== "staff" ||
    (user.role?.toLowerCase() !== "teknisi" && user.role?.toLowerCase() !== "karyawan")
  ) {
    return null
  }

  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  const skip = (currentPage - 1) * pageSize

  const whereClause = {
    teknisiId: user.id,
    status_servis: "Konfirmasi Teknisi",
  }

  const [tasks, totalCount] = await Promise.all([
    db.services.findMany({
      where: whereClause,
      include: {
        customer: {
          include: {
            customerProfile: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
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
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Penugasan Baru</h1>
            <p className="text-slate-500 font-medium text-base">Konfirmasi pesanan servis yang ditugaskan kepada Anda sebelum memulai pengerjaan.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-0 shadow-none overflow-hidden">
        <div className="p-0">
          <TugasTable tasks={tasks} />
        </div>
        {totalPages > 1 && (
          <div className="p-6 bg-slate-50/20">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/dashboard/tugas"
            />
          </div>
        )}
      </div>
    </div>
  )
}
