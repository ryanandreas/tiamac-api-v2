import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
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
import { Search, CreditCard, Eye, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"

export default async function TransaksiPage() {
  const transactions = await db.services.findMany({
    where: {
      status_servis: {
        in: ["Menunggu Pembayaran", "Selesai (Garansi Aktif)"]
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
      <DashboardHeader title="Pembayaran & Transaksi" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            <h2 className="text-2xl font-bold tracking-tight">Manajemen Transaksi</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari transaksi (Nama, ID)..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pesanan</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Total Biaya</TableHead>
                <TableHead>Status Pembayaran</TableHead>
                <TableHead>Update Terakhir</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Belum ada data transaksi.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tr) => (
                  <TableRow key={tr.id}>
                    <TableCell className="font-medium">#{tr.id.slice(0, 8)}</TableCell>
                    <TableCell>{tr.customer.name}</TableCell>
                    <TableCell>{formatPrice(tr.biaya || 0)}</TableCell>
                    <TableCell>
                      {tr.status_servis === "Selesai (Garansi Aktif)" ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">Lunas</Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Menunggu</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(tr.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" title="Detail Invoice"><FileText className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" title="Lihat"><Eye className="h-4 w-4" /></Button>
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
