import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/app/actions/session"
import { db } from "@/lib/db"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { History, Eye, CheckCircle, Clock } from "lucide-react"

export default async function RiwayatTeknisiPage() {
  const user = await getCurrentUser()
  
  const tasks = await db.services.findMany({
    where: {
      teknisiId: user.id,
      status_servis: {
        in: ["Pekerjaan Selesai", "Menunggu Pembayaran", "Selesai (Garansi Aktif)"]
      }
    },
    include: {
      customer: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  })

  return (
    <SidebarInset>
      <DashboardHeader title="Riwayat Servis" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6" />
          <h2 className="text-2xl font-bold tracking-tight">Riwayat Pekerjaan</h2>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Jenis Servis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Selesai</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Belum ada riwayat pekerjaan selesai.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">#{task.id.slice(0, 8)}</TableCell>
                    <TableCell>{task.customer.name}</TableCell>
                    <TableCell>{task.jenis_servis}</TableCell>
                    <TableCell>
                      {task.status_servis === "Selesai (Garansi Aktif)" ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">Selesai</Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">{task.status_servis}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(task.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" title="Lihat Detail"><Eye className="h-4 w-4" /></Button>
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
