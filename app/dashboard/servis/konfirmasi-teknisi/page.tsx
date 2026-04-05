import { ServiceListTable } from "@/components/dashboard/service-list-table"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { db } from "@/lib/db"

export default async function KonfirmasiTeknisiPage() {
  const services = await db.services.findMany({
    where: {
      status_servis: "Konfirmasi Teknisi"
    },
    include: {
      customer: true,
      teknisi: true
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <SidebarInset>
      <DashboardHeader title="Konfirmasi Teknisi" />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Konfirmasi Teknisi</h2>
        </div>
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <p className="text-muted-foreground">
                Pesanan dengan teknisi yang sudah dijadwalkan dan siap dikerjakan.
              </p>
            </div>
          </div>
          <ServiceListTable data={services} />
        </div>
      </div>
    </SidebarInset>
  )
}
