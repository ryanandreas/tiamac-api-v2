import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
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
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-4">
        <DynamicBreadcrumbs />
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Manajemen Transaksi</h1>
          <p className="text-slate-500 font-medium text-base">Pantau riwayat pembayaran dan status invoice pesanan servis.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-0 shadow-none overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row md:items-center gap-4 bg-white">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors" />
            <Input
              type="search"
              placeholder="Cari transaksi (Nama, ID)..."
              className="pl-10 h-10 w-full text-sm font-medium border border-slate-100 rounded-xl focus-visible:ring-[#66B21D] outline-none shadow-none bg-slate-50/50 placeholder:text-slate-300 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/10">
              <TableRow className="border-slate-50 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-slate-400 h-12 pl-6">ID Pesanan</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12">Pelanggan</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12 text-center">Total Biaya</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12 text-center">Status Pembayaran</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12 text-center">Update Terakhir</TableHead>
                <TableHead className="text-right text-xs font-bold text-slate-400 h-12 pr-6">Aksi</TableHead>
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
                  <TableRow key={tr.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                    <TableCell className="py-4 pl-6">
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-[#66B21D] transition-colors leading-none tracking-widest">#{tr.id.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell className="py-4 font-black text-sm text-slate-900 group-hover:text-[#66B21D] transition-colors">{tr.customer.name}</TableCell>
                    <TableCell className="py-4 text-center font-black text-sm text-slate-900">{formatPrice(tr.biaya || 0)}</TableCell>
                    <TableCell className="py-4 text-center">
                      {tr.status_servis === "Selesai (Garansi Aktif)" ? (
                        <Badge className="bg-green-50 text-green-600 border-none text-[9px] font-black uppercase tracking-widest rounded-lg px-2 py-1">LUNAS</Badge>
                      ) : (
                        <Badge className="bg-yellow-50 text-yellow-600 border-none text-[9px] font-black uppercase tracking-widest rounded-lg px-2 py-1">MENUNGGU</Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-center text-xs font-bold text-slate-500">{new Date(tr.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell className="py-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-[#66B21D] hover:border-green-100 hover:bg-green-50 transition-all" title="Detail Invoice">
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50 transition-all" title="Lihat">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
