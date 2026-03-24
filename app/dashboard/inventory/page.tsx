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
import { Plus, Search, Package, Edit2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import Link from "next/link"
import { Pagination } from "@/components/pagination"
import { getCurrentUser } from "@/app/actions/session"

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const user = await getCurrentUser()
  if (!user.isAuthenticated) return null

  const isTechnician =
    user.type === "staff" &&
    (user.role?.toLowerCase() === "teknisi" || user.role?.toLowerCase() === "karyawan")

  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  const skip = (currentPage - 1) * pageSize

  const [items, totalCount] = await Promise.all([
    db.inventoryItem.findMany({
      orderBy: {
        nama: "asc"
      },
      skip,
      take: pageSize,
    }),
    db.inventoryItem.count()
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Manajemen Inventory</h1>
            <p className="text-slate-500 font-medium text-base">Kelola ketersediaan sparepart dan material teknisi.</p>
          </div>
        </div>
        {!isTechnician && (
          <Button className="h-11 px-6 rounded-xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-bold text-xs border-none shadow-none gap-2 transition-all active:scale-95">
            <Plus className="h-4 w-4" /> Tambah Barang Baru
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border-0 shadow-none overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row md:items-center gap-4 bg-white">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors pointer-events-none" />
            <input
              placeholder="Cari sparepart atau material..."
              className="pl-10 h-10 w-full text-sm font-medium border border-slate-100 rounded-xl focus-visible:ring-[#66B21D] outline-none shadow-none bg-slate-50/50 placeholder:text-slate-300 transition-all"
            />
          </div>
          <div className="flex-1"></div>
          <p className="text-xs font-bold text-slate-400">Total {totalCount} Barang</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/10">
              <TableRow className="border-slate-50 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-slate-400 h-12 pl-8">SKU</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12">Nama Barang</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12 text-center">Stok</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12 text-center">Harga Jual</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12 text-center">Status</TableHead>
                <TableHead className="text-right text-xs font-bold text-slate-400 h-12 pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-32">
                    <div className="flex flex-col items-center gap-2">
                       <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-2">
                        <Package className="h-6 w-6" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gudang Kosong</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                    <TableCell className="py-6 pl-8">
                       <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#66B21D] transition-colors leading-none tracking-widest">#{item.sku}</span>
                    </TableCell>
                    <TableCell className="py-6">
                       <p className="text-sm font-bold text-slate-900 group-hover:text-[#66B21D] transition-colors">{item.nama}</p>
                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">{item.uom}</span>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                       <span className={`text-sm font-bold ${item.qtyOnHand <= (item.minStock || 0) ? 'text-red-500' : 'text-slate-900'}`}>{item.qtyOnHand}</span>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                       <span className="text-sm font-bold text-slate-900">{formatPrice(item.harga)}</span>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      {item.qtyOnHand <= (item.minStock || 0) ? (
                        <Badge className="bg-red-50 text-red-600 border-none text-[9px] font-bold uppercase tracking-widest rounded-lg px-2 py-1">STOK RENDAH</Badge>
                      ) : (
                        <Badge className="bg-green-50 text-green-600 border-none text-[9px] font-bold uppercase tracking-widest rounded-lg px-2 py-1">TERSEDIA</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-6 pr-8">
                       {isUserAdmin(user) ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-[#66B21D] hover:border-green-100 hover:bg-green-50 transition-all">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                       ) : (
                         <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest pr-2">Read Only</span>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-6 bg-slate-50/20">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/dashboard/inventory"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function isUserAdmin(user: any) {
  return user.type === "admin" || (user.type === "staff" && user.role?.toLowerCase() === "admin")
}
