import { KanbanBoard } from "@/components/dashboard/kanban-board"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { db } from "@/lib/db"

export default async function OverviewPage() {
  const services = await db.services.findMany({
    where: {
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
    },
    include: {
      customer: true,
      teknisi: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <SidebarInset className="h-screen flex flex-col overflow-hidden">
      <DashboardHeader title="Overview" />
      <div className="flex-1 flex flex-col p-4 pt-4 overflow-hidden">
        <div className="flex items-center justify-between space-y-2 mb-4 shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">Service Overview</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <KanbanBoard data={services} />
        </div>
      </div>
    </SidebarInset>
  )
}
