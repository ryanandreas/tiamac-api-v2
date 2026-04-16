import { redirect } from "next/navigation"

import { getCurrentUser } from "@/app/actions/session"
import { PengecekanWorkstation } from "@/components/technician/pengecekan-workstation"
import { db } from "@/lib/db"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"

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
    user.role?.toLowerCase() !== "teknisi"
  ) {
    redirect("/dashboard")
  }

  const service = await db.services.findUnique({
    where: { id },
    include: {
      customer: { include: { customerProfile: true } },
      teknisi: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
      materialUsages: { include: { item: { select: { nama: true, uom: true } } }, orderBy: { createdAt: "desc" } },
      acUnits: { 
        include: { layanan: true },
        orderBy: { createdAt: "asc" }
      },
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
    <div className="space-y-4 animate-fade-in font-outfit">
      <div className="px-2">
        <DynamicBreadcrumbs />
      </div>

      <PengecekanWorkstation
        serviceId={service.id}
        statusServis={service.status_servis}
        customerName={service.customer?.name ?? "-"}
        customerAlamat={service.alamat_servis || service.customer?.customerProfile?.alamat || "-"}
        teknisiName={service.teknisi?.name ?? "-"}
        statusHistory={service.statusHistory}
        jadwal={extractJadwal(service.keluhan ?? "") ?? null}
        biayaDasar={service.biaya_dasar ?? 50000}
        acUnits={service.acUnits}
        catalogRows={catalogRows}
        inventoryItems={inventoryItems}
        usages={service.materialUsages}
      />
    </div>
  )
}
