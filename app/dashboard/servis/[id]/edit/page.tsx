import { notFound } from "next/navigation"
import { BookingService } from "@/lib/services/booking-service"
import { db } from "@/lib/db"
import { EditServiceForm } from "@/components/dashboard/edit-service-form"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"

interface EditPageProps {
  params: { id: string }
}

export default async function EditServicePage({ params }: EditPageProps) {
  const { id } = await params
  
  const service = await db.services.findUnique({
    where: { id },
    include: {
      customer: { include: { customerProfile: true } },
      teknisi: { select: { id: true, name: true } },
      acUnits: { include: { layanan: true } },
      materialUsages: { include: { item: { select: { nama: true, uom: true } } } },
    },
  })

  if (!service) {
    notFound()
  }

  const [technicians, inventoryItems, catalogRows] = await Promise.all([
    db.user.findMany({
      where: {
        OR: [
          {
            staffProfile: {
              role: {
                in: ["teknisi", "karyawan", "Staff", "Teknisi"],
                mode: "insensitive"
              }
            }
          },
          // Ensure current assigned technician is always included
          ...(service.teknisiId ? [{ id: service.teknisiId }] : [])
        ]
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: "asc"
      }
    }),
    db.inventoryItem.findMany({
      select: { id: true, nama: true, uom: true, harga: true, qtyOnHand: true },
      orderBy: { nama: "asc" },
    }),
    db.acServiceCatalog.findMany({
      select: { uuid: true, nama: true, pk: true, harga: true },
      orderBy: [{ nama: "asc" }, { pk: "asc" }],
    })
  ])

  return (
    <div className="space-y-8 animate-fade-in p-4 md:p-0">
      <div className="space-y-4">
        <DynamicBreadcrumbs />
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Detail Pengerjaan</h1>
          <p className="text-slate-500 font-medium">Ubah status, teknisi, atau jadwal kunjungan pesanan.</p>
        </div>
      </div>

      <EditServiceForm 
        service={service} 
        technicians={technicians} 
        inventoryItems={inventoryItems}
        catalogRows={catalogRows}
      />
    </div>
  )
}
