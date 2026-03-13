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
import { Plus, Search, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"

export default async function LayananPage() {
  const catalog = await db.acServiceCatalog.findMany({
    orderBy: {
      nama: "asc"
    }
  })

  return (
    <SidebarInset>
      <DashboardHeader title="Layanan & Harga" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-6 w-6" />
            <h2 className="text-2xl font-bold tracking-tight">Katalog Layanan</h2>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Layanan
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari layanan..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Layanan</TableHead>
                <TableHead>PK</TableHead>
                <TableHead>Harga Dasar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Belum ada data katalog layanan.
                  </TableCell>
                </TableRow>
              ) : (
                catalog.map((item) => (
                  <TableRow key={item.uuid}>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>{item.pk || "-"}</TableCell>
                    <TableCell>{formatPrice(item.harga)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
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
