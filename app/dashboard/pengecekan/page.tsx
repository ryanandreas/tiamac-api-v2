import type { Metadata } from "next"
import { db } from "@/lib/db"
import { Search, MapPin, Phone, ArrowRight, Activity } from "lucide-react"
import { getCurrentUser } from "@/app/actions/session"
import { redirect } from "next/navigation"
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

export const metadata: Metadata = {
  title: "Cek & Diagnosa",
}

export default async function PengecekanListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const user = await getCurrentUser()
  if (
    !user.isAuthenticated ||
    user.type !== "staff" ||
    user.role?.toLowerCase() !== "teknisi"
  ) {
    redirect("/dashboard")
  }

  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  const skip = (currentPage - 1) * pageSize

  const whereClause = {
    teknisiId: user.id,
    status_servis: { in: ["Konfirmasi Teknisi", "Dalam Pengecekan"] },
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Pengecekan & Diagnosa</h1>
            <p className="text-slate-500 font-medium text-base">Tahap pengecekan unit di lokasi sebelum mulai pengerjaan perbaikan.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-0 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow className="border-slate-50 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 h-12 pl-8">Waktu & Tanggal</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 h-12">Detail Pelanggan</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 h-12 text-center">Status</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 h-12 pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-2">
                        <Activity className="h-6 w-6" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada unit yang perlu dicek saat ini</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                services.map((s) => (
                  <TableRow key={s.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                    <TableCell className="py-6 pl-8">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{extractJadwal(s.keluhan ?? "") || "-"}</span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">ID: #{s.id.slice(0, 8)}</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{s.customer?.name || "-"}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <Phone className="h-3 w-3 text-slate-300" />
                           <span className="text-[10px] font-bold text-slate-400">{s.customer?.customerProfile?.no_telp || "-"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                       <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap">
                        {s.status_servis}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-6 pr-8">
                      <Button className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest gap-2 transition-all" asChild>
                        <Link href={`/dashboard/pengecekan/${s.id}`}>
                          Mulai Pengecekan
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
          <div className="p-6 bg-slate-50/20">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/dashboard/pengecekan"
            />
          </div>
        )}
      </div>
    </div>
  )
}

