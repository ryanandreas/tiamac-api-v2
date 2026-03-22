import type { Metadata } from "next"
import { db } from "@/lib/db"
import { History, Eye, Search, MapPin, Calendar, CheckCircle2, Clock } from "lucide-react"
import { getCurrentUser } from "@/app/actions/session"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Pagination } from "@/components/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Riwayat Kerja",
}

export default async function RiwayatTeknisiPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const user = await getCurrentUser()
  if (
    !user.isAuthenticated ||
    user.type !== "staff" ||
    (user.role?.toLowerCase() !== "teknisi" && user.role?.toLowerCase() !== "karyawan")
  ) {
    return null
  }

  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  const skip = (currentPage - 1) * pageSize

  const whereClause = {
    teknisiId: user.id,
    status_servis: {
      in: ["Pekerjaan Selesai", "Menunggu Pembayaran", "Selesai (Garansi Aktif)"]
    }
  }

  const [tasks, totalCount] = await Promise.all([
    db.services.findMany({
      where: whereClause,
      include: {
        customer: true
      },
      orderBy: {
        updatedAt: "desc"
      },
      skip,
      take: pageSize,
    }),
    db.services.count({ where: whereClause })
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Riwayat Kerja</h1>
            <p className="text-slate-500 font-medium text-base">Daftar semua pekerjaan servis yang telah Anda selesaikan.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-0 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow className="border-slate-50 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 pl-8">ID Servis</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12">Pelanggan</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12">Layanan</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12">Tgl Selesai</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-2">
                        <History className="h-6 w-6" />
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Belum ada riwayat pekerjaan selesai</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                    <TableCell className="py-6 pl-8">
                       <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-wider">#{task.id.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{task.customer.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Identitas Member</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                       <Badge variant="outline" className="h-5 px-2 text-[9px] font-black uppercase tracking-widest border-slate-100 bg-slate-50 text-slate-500 rounded-lg">
                        {task.jenis_servis}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                       {task.status_servis === "Selesai (Garansi Aktif)" ? (
                        <div className="flex items-center justify-center gap-1.5 text-green-600">
                           <CheckCircle2 className="h-3.5 w-3.5" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Selesai</span>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap bg-blue-50 text-blue-600">
                          {task.status_servis}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-6">
                       <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-slate-300" />
                          <span className="text-[11px] font-black text-slate-600 uppercase">{new Date(task.updatedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right py-6 pr-8">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors" title="Lihat Detail">
                        <Eye className="h-4 w-4" />
                      </Button>
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
              baseUrl="/dashboard/riwayat"
            />
          </div>
        )}
      </div>
    </div>
  )
}
