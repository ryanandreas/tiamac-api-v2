import { db } from "@/lib/db"
import { Briefcase, Bell } from "lucide-react"
import { TugasTable } from "@/components/technician/tugas-table"
import { getCurrentUser } from "@/app/actions/session"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Pagination } from "@/components/pagination"

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "Teknisi Dikonfirmasi", label: "Teknisi Dikonfirmasi" },
  { value: "Dalam Pengecekan", label: "Dalam Pengecekan" },
  { value: "Menunggu Persetujuan Customer", label: "Menunggu Persetujuan Customer" },
  { value: "Sedang Dikerjakan", label: "Sedang Dikerjakan" },
]

export default async function TugasTeknisiPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const user = await getCurrentUser()
  if (
    !user.isAuthenticated ||
    user.type !== "staff" ||
    (user.role?.toLowerCase() !== "teknisi" && user.role?.toLowerCase() !== "karyawan")
  ) {
    return null
  }

  const { status, page } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  const skip = (currentPage - 1) * pageSize

  const selectedStatus = status && STATUS_OPTIONS.some((s) => s.value === status) ? status : "all"
  const statusFilter =
    selectedStatus === "all"
      ? ["Teknisi Dikonfirmasi", "Dalam Pengecekan", "Menunggu Persetujuan Customer", "Sedang Dikerjakan"]
      : [selectedStatus]

  const whereClause = {
    teknisiId: user.id,
    status_servis: {
      in: statusFilter,
    },
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Bell className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-black text-orange-600 uppercase tracking-widest">Penugasan</h1>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tugas Servis</h2>
          <DynamicBreadcrumbs />
          <p className="text-slate-500 font-bold text-sm mt-1">Daftar semua tugas pengerjaan yang ditugaskan kepada Anda.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="p-1">
          <TugasTable tasks={tasks} selectedStatus={selectedStatus} />
        </div>
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 bg-slate-50/20">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/dashboard/tugas"
              searchParams={{ status: selectedStatus }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
