import { redirect } from "next/navigation"

import { getCurrentUser } from "@/app/actions/session"
import { PengecekanDetail } from "@/components/technician/pengecekan-detail"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { db } from "@/lib/db"

function extractJadwal(keluhan: string) {
  const match = keluhan.match(/^Jadwal:\s*(.+)$/im)
  return match?.[1]?.trim()
}

export default async function PengecekanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (
    !user.isAuthenticated ||
    user.type !== "staff" ||
    (user.role?.toLowerCase() !== "teknisi" && user.role?.toLowerCase() !== "karyawan")
  ) {
    redirect("/login")
  }

  const service = await db.services.findUnique({
    where: { id },
    include: {
      customer: { include: { customerProfile: true } },
      materialUsages: { include: { item: { select: { nama: true, uom: true } } }, orderBy: { createdAt: "desc" } },
      acUnits: { include: { layanan: true } },
    },
  })

  if (!service || service.teknisiId !== user.id) {
    redirect("/dashboard/tugas")
  }

  const inventoryItems = await db.inventoryItem.findMany({
    select: { id: true, nama: true, uom: true, harga: true, qtyOnHand: true },
    orderBy: { nama: "asc" },
  })

  const catalogRows = await db.acServiceCatalog.findMany({
    select: { uuid: true, nama: true, pk: true, harga: true },
    orderBy: [{ nama: "asc" }, { pk: "asc" }],
  })

  return (
    <SidebarInset>
      <DashboardHeader title="Pengecekan" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <PengecekanDetail
          serviceId={service.id}
          statusServis={service.status_servis}
          customerName={service.customer?.name ?? "-"}
          customerAlamat={service.customer?.customerProfile?.alamat ?? "-"}
          jadwal={extractJadwal(service.keluhan ?? "") ?? null}
          biayaDasar={service.biaya_dasar ?? 50000}
          acUnits={service.acUnits}
          catalogRows={catalogRows}
          inventoryItems={inventoryItems}
          usages={service.materialUsages}
        />
      </div>
    </SidebarInset>
  )
}
