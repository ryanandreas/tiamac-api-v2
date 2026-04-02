import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/session"
import { WorkDocumentation } from "@/components/technician/work-documentation"
import { db } from "@/lib/db"

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
    <WorkDocumentation serviceData={serviceData} />
  )
}
