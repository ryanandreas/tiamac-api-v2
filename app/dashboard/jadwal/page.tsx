import { SchedulingTable } from "@/components/dashboard/scheduling-table"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { db } from "@/lib/db"

export default async function JadwalPage() {
  const services = await db.services.findMany({
    where: {
      status_servis: "Menunggu Jadwal",
    },
    include: {
      customer: { include: { customerProfile: true } },
      teknisi: true,
      acUnits: { include: { layanan: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const teknisiProfiles = await db.staffProfile.findMany({
    where: {
      role: { in: ["karyawan", "teknisi"] },
    },
    include: { user: { select: { uuid: true, name: true } } },
  })

  const teknisi = teknisiProfiles.map((row) => row.user)

  return (
    <SidebarInset>
      <DashboardHeader title="Jadwal Perbaikan" />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Jadwal Perbaikan</h2>
        </div>
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <p className="text-muted-foreground">
                Tetapkan teknisi dan jadwal untuk pesanan baru.
              </p>
            </div>
          </div>
          <SchedulingTable data={services} teknisi={teknisi} />
        </div>
      </div>
    </SidebarInset>
  )
}
