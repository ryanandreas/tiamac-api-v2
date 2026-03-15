import { db } from "@/lib/db"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Search, Tag, Edit2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"
import { Pagination } from "@/components/pagination"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { getCurrentUser } from "@/app/actions/session"

export default async function LayananPage({
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

  const [catalog, totalCount] = await Promise.all([
    db.acServiceCatalog.findMany({
      orderBy: {
        nama: "asc"
      },
      skip,
      take: pageSize,
    }),
    db.acServiceCatalog.count()
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Tag className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-black text-blue-600 uppercase tracking-widest">Katalog Produk</h1>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Layanan & Harga</h2>
          <DynamicBreadcrumbs />
          <p className="text-slate-500 font-bold text-sm mt-1">Atur daftar jasa servis AC dan penyesuaian harga terbaru.</p>
        </div>
        {!isTechnician && (
          <Button className="h-11 px-6 rounded-2xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-xs shadow-lg shadow-green-500/20 gap-2 transition-all">
            <Plus className="h-4 w-4" /> Tambah Layanan Baru
          </Button>
        )}
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center gap-4 bg-white">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors pointer-events-none" />
            <Input
              placeholder="Cari nama layanan..."
              className="pl-10 h-10 text-[11px] font-black uppercase tracking-widest border-slate-100 rounded-xl focus-visible:ring-[#66B21D] shadow-none bg-slate-50/50 placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow className="border-slate-50 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 pl-8">Jenis Layanan</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12">PK / Kapasitas</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 text-center">Harga Dasar</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-2">
                        <Tag className="h-6 w-6" />
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Belum ada data layanan</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                catalog.map((item) => (
                  <TableRow key={item.uuid} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                    <TableCell className="py-6 pl-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 group-hover:text-[#66B21D] transition-colors">{item.nama}</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">ID: {item.uuid.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                       <div className="flex items-center">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">{item.pk || "-"}</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                       <span className="text-sm font-black text-slate-900">{formatPrice(item.harga)}</span>
                    </TableCell>
                    <TableCell className="text-right py-6 pr-8">
                       {!isTechnician ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-[#66B21D] hover:border-green-100 hover:bg-green-50 transition-all">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                       ) : (
                         <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest pr-2">Read Only</span>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 bg-slate-50/20">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/dashboard/layanan"
            />
          </div>
        )}
      </div>
    </div>
  )
}
