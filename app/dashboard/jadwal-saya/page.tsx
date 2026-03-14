import Link from "next/link"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/app/actions/session"
import { DashboardHeader } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarInset } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "@/lib/db"

function extractJadwal(keluhan: string) {
  const match = keluhan.match(/^Jadwal:\s*(.+)$/im)
  return match?.[1]?.trim()
}

function actionForStatus(status: string, serviceId: string) {
  if (status === "Sedang Dikerjakan") return `/dashboard/pengerjaan/${serviceId}`
  if (status === "Dalam Pengecekan" || status === "Teknisi Dikonfirmasi") return `/dashboard/pengecekan/${serviceId}`
  return `/dashboard/tugas`
}

export default async function JadwalSayaPage() {
  const user = await getCurrentUser()
  if (
    !user.isAuthenticated ||
    user.type !== "staff" ||
    (user.role?.toLowerCase() !== "teknisi" && user.role?.toLowerCase() !== "karyawan")
  ) {
    redirect("/login")
  }

  const services = await db.services.findMany({
    where: {
      teknisiId: user.id,
      status_servis: { in: ["Teknisi Dikonfirmasi", "Dalam Pengecekan", "Sedang Dikerjakan"] },
    },
    include: { customer: { include: { customerProfile: true } } },
    orderBy: { updatedAt: "desc" },
  })

  const rows = services
    .map((s) => ({ ...s, jadwal: extractJadwal(s.keluhan ?? "") }))
    .sort((a, b) => (a.jadwal ?? "").localeCompare(b.jadwal ?? ""))

  return (
    <SidebarInset>
      <DashboardHeader title="Jadwal Saya" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Belum ada jadwal servis.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.jadwal || "-"}</TableCell>
                    <TableCell>{s.customer?.name || "-"}</TableCell>
                    <TableCell>{s.customer?.customerProfile?.alamat || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {s.status_servis}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" asChild>
                        <Link href={actionForStatus(s.status_servis, s.id)}>Buka</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </SidebarInset>
  )
}

