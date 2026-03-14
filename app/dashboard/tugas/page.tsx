import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/app/actions/session"
import { db } from "@/lib/db"
import { Briefcase } from "lucide-react"
import { TugasTable } from "@/components/technician/tugas-table"

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
  searchParams: Promise<{ status?: string }>
}) {
  const user = await getCurrentUser()
  if (
    !user.isAuthenticated ||
    user.type !== "staff" ||
    (user.role?.toLowerCase() !== "teknisi" && user.role?.toLowerCase() !== "karyawan")
  ) {
    return null
  }

  const { status } = await searchParams
  const selectedStatus = status && STATUS_OPTIONS.some((s) => s.value === status) ? status : "all"
  const statusFilter =
    selectedStatus === "all"
      ? ["Teknisi Dikonfirmasi", "Dalam Pengecekan", "Menunggu Persetujuan Customer", "Sedang Dikerjakan"]
      : [selectedStatus]

  const tasks = await db.services.findMany({
    where: {
      teknisiId: user.id,
      status_servis: {
        in: statusFilter,
      },
    },
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
  })

  return (
    <SidebarInset>
      <DashboardHeader title="Tugas Saya" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <h2 className="text-2xl font-bold tracking-tight">Tugas Servis</h2>
          </div>
        </div>

        <TugasTable tasks={tasks} selectedStatus={selectedStatus} />
      </div>
    </SidebarInset>
  )
}
