import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/session"
import { PengerjaanWorkstation } from "@/components/technician/pengerjaan-workstation"
import { db } from "@/lib/db"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Badge } from "@/components/ui/badge"

export default async function PengerjaanDetailPage({
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
      customer: {
        include: {
          customerProfile: true,
        },
      },
      teknisi: {
        include: {
          staffProfile: true,
        },
      },
      acUnits: {
        include: {
          layanan: true,
        },
      },
      materialUsages: {
        include: {
          item: true,
        },
      },
    },
  })

  if (!service || service.teknisiId !== user.id) {
    redirect("/dashboard/ongoing")
  }

  // Map to a cleaner object for the component
  const serviceData = {
    id: service.id,
    status_servis: service.status_servis,
    biaya_dasar: service.biaya_dasar || 50000,
    estimasi_biaya: service.estimasi_biaya || 0,
    customer: {
      name: service.customer.name,
      phone: service.customer.customerProfile?.no_telp || "-",
      address: service.customer.customerProfile?.alamat || "-",
    },
    teknisi: {
      name: service.teknisi?.name || "Belum Ditugaskan",
      role: service.teknisi?.staffProfile?.role || "Staff",
    },
    services: service.acUnits.flatMap((unit) => 
      unit.layanan.map((l) => ({
        nama: l.nama,
        harga: l.harga,
        unitPk: unit.pk
      }))
    ),
    materials: service.materialUsages.map((m) => ({
      nama: m.item.nama,
      qty: m.qty,
      harga: m.harga_satuan,
    }))
  }

  return (
    <div className="space-y-4 animate-fade-in font-outfit">
      <div className="bg-white px-6 py-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-none shadow-none">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Terminal Pengerjaan</h1>
          <DynamicBreadcrumbs />
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-orange-50 text-orange-600 border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
             {service.status_servis}
          </Badge>
          <span className="text-xs font-bold text-slate-300">ID: #{service.id.slice(-8).toUpperCase()}</span>
        </div>
      </div>

      <PengerjaanWorkstation serviceData={serviceData} />
    </div>
  )
}
