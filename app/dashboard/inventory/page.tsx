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
import { Plus, Search, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"

export default async function InventoryPage() {
  const items = await db.inventoryItem.findMany({
    orderBy: {
      nama: "asc"
    }
  })

  return (
    <SidebarInset>
      <DashboardHeader title="Inventory & Sparepart" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <h2 className="text-2xl font-bold tracking-tight">Manajemen Inventory</h2>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Barang
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari barang..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead>Status Stok</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Belum ada data barang inventory.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>{item.qtyOnHand}</TableCell>
                    <TableCell>{item.uom}</TableCell>
                    <TableCell>{formatPrice(item.harga)}</TableCell>
                    <TableCell>
                      {item.qtyOnHand <= (item.minStock || 0) ? (
                        <Badge variant="destructive">Stok Menipis</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-600">Tersedia</Badge>
                      )}
                    </TableCell>
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
