import { notFound } from "next/navigation"
import { BookingService } from "@/lib/services/booking-service"
import { db } from "@/lib/db"
import { EditServiceForm } from "@/components/dashboard/edit-service-form"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

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
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in font-outfit p-4 md:p-0">
      <div className="space-y-6">
        <DynamicBreadcrumbs />
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#66B21D]/10 text-[#66B21D] border-none shadow-none font-black text-[10px] uppercase tracking-widest h-7 px-4 rounded-full">
                Workstation Editor
              </Badge>
              <span className="text-slate-300 font-bold">•</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Order ID #{service.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Management Terminal</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/servis">
              <Button variant="outline" className="bg-white border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest h-12 px-6 rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Kembali
              </Button>
            </Link>
          </div>
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
