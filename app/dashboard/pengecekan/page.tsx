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

export default async function PengecekanListPage() {
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
      status_servis: { in: ["Teknisi Dikonfirmasi", "Dalam Pengecekan"] },
    },
    include: { customer: { include: { customerProfile: true } } },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <SidebarInset>
      <DashboardHeader title="Dalam Pengecekan" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Tidak ada servis untuk pengecekan.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{extractJadwal(s.keluhan ?? "") || "-"}</TableCell>
                    <TableCell>{s.customer?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {s.status_servis}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/pengecekan/${s.id}`}>Buka</Link>
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

