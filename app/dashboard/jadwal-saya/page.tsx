import { db } from "@/lib/db"
import { Calendar, Search, MapPin, Phone, ArrowRight } from "lucide-react"
import { getCurrentUser } from "@/app/actions/session"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Pagination } from "@/components/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

function extractJadwal(keluhan: string) {
  const match = keluhan.match(/^Jadwal:\s*(.+)$/im)
  return match?.[1]?.trim()
}

function actionForStatus(status: string, serviceId: string) {
  if (status === "Sedang Dikerjakan") return `/dashboard/pengerjaan/${serviceId}`
  if (status === "Dalam Pengecekan" || status === "Teknisi Dikonfirmasi") return `/dashboard/pengecekan/${serviceId}`
  return `/dashboard/tugas`
}

export default async function JadwalSayaPage({
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
    status_servis: { in: ["Teknisi Dikonfirmasi", "Dalam Pengecekan", "Sedang Dikerjakan"] },
  }

  const [services, totalCount] = await Promise.all([
    db.services.findMany({
      where: whereClause,
      include: { customer: { include: { customerProfile: true } } },
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.services.count({ where: whereClause })
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  const rows = services
    .map((s) => ({ ...s, jadwal: extractJadwal(s.keluhan ?? "") }))
    .sort((a, b) => (a.jadwal ?? "").localeCompare(b.jadwal ?? ""))

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-black text-blue-600 uppercase tracking-widest">Penjadwalan</h1>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Jadwal Servis</h2>
          <DynamicBreadcrumbs />
          <p className="text-slate-500 font-bold text-sm mt-1">Daftar giliran kunjungan dan perbaikan unit AC pelanggan.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow className="border-slate-50 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 pl-8">Waktu & Jadwal</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12">Informasi Pelanggan</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12">Lokasi Tujuan</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 text-center">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 h-12 pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-2">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Belum ada jadwal servis terdaftar</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((s) => (
                  <TableRow key={s.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                    <TableCell className="py-6 pl-8">
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900">{s.jadwal || "-"}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Estimasi Kunjungan</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{s.customer?.name || "-"}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <Phone className="h-3 w-3 text-slate-300" />
                           <span className="text-[10px] font-bold text-slate-400">{s.customer?.customerProfile?.no_telp || "-"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                       <div className="flex items-start gap-2 max-w-[200px]">
                          <MapPin className="h-3.5 w-3.5 text-slate-300 mt-0.5 shrink-0" />
                          <span className="text-[10px] font-bold text-slate-400 line-clamp-2">{s.customer?.customerProfile?.alamat || "-"}</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                       <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap">
                        {s.status_servis}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-6 pr-8">
                      <Button className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest gap-2 transition-all" asChild>
                        <Link href={actionForStatus(s.status_servis, s.id)}>
                          Buka Detail
                          <ArrowRight className="h-3.5 w-3.5 text-white" />
                        </Link>
                      </Button>
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
              baseUrl="/dashboard/jadwal-saya"
            />
          </div>
        )}
      </div>
    </div>
  )
}

