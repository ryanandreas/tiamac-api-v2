import { redirect } from "next/navigation"

import { getCurrentUser } from "@/app/actions/session"
import { DashboardHeader } from "@/components/dashboard/header"
import { BuktiUpload } from "@/components/technician/bukti-upload"
import { SidebarInset } from "@/components/ui/sidebar"
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
    select: { id: true, teknisiId: true, status_servis: true },
  })

  if (!service || service.teknisiId !== user.id) {
    redirect("/dashboard/tugas")
  }

  return (
    <SidebarInset>
      <DashboardHeader title="Pengerjaan" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <BuktiUpload serviceId={service.id} statusServis={service.status_servis} />
      </div>
    </SidebarInset>
  )
}

