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
import { Plus, Search, Package, Edit2, Trash2, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"

export default async function InventoryPage() {
  const items = await db.inventoryItem.findMany({
    orderBy: {
      nama: "asc"
    }
  })

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-xl bg-green-50 flex items-center justify-center text-[#66B21D]">
              <Package className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-black text-[#66B21D] uppercase tracking-widest">Gudang & Stok</h1>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Inventory</h2>
          <DynamicBreadcrumbs />
        </div>
        <Button className="h-11 px-6 rounded-2xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-xs shadow-lg shadow-green-500/20 gap-2 transition-all">
          <Plus className="h-4 w-4" /> Tambah Barang Baru
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors" />
              <Input
                type="search"
                placeholder="Cari sparepart atau material..."
                className="pl-10 h-10 text-xs font-black uppercase tracking-widest border-slate-100 rounded-xl focus-visible:ring-[#66B21D] shadow-none"
              />
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center gap-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total {items.length} Barang</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-50 hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12">SKU</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12">Nama Barang</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12">Stok</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12">Satuan</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12">Harga Jual</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12">Status</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400 h-12 pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-24">
                      <div className="flex flex-col items-center">
                        <div className="size-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 text-slate-200">
                          <Package className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Gudang Kosong</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="py-4">
                         <span className="text-xs font-black text-slate-400 group-hover:text-[#66B21D] transition-colors">#{item.sku}</span>
                      </TableCell>
                      <TableCell className="py-4">
                         <p className="text-sm font-black text-slate-900">{item.nama}</p>
                      </TableCell>
                      <TableCell className="py-4">
                         <span className={`text-sm font-black ${item.qtyOnHand <= (item.minStock || 0) ? 'text-red-500' : 'text-slate-900'}`}>{item.qtyOnHand}</span>
                      </TableCell>
                      <TableCell className="py-4">
                         <span className="text-xs font-bold text-slate-400">{item.uom}</span>
                      </TableCell>
                      <TableCell className="py-4">
                         <span className="text-sm font-black text-slate-900">{formatPrice(item.harga)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        {item.qtyOnHand <= (item.minStock || 0) ? (
                          <Badge className="bg-red-50 text-red-600 border-none text-[9px] font-black uppercase tracking-widest h-5">STOK RENDAH</Badge>
                        ) : (
                          <Badge className="bg-green-50 text-green-600 border-none text-[9px] font-black uppercase tracking-widest h-5">TERSEDIA</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-green-50 hover:text-[#66B21D] transition-all">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
