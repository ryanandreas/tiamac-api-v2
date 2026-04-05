import type { Metadata } from "next"
import { db } from "@/lib/db"
import { Calendar } from "lucide-react"
import { getCurrentUser } from "@/app/actions/session"
import { redirect } from "next/navigation"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Pagination } from "@/components/pagination"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { JadwalTableBody } from "./jadwal-table-body"

export const metadata: Metadata = {
  title: "Jadwal Servis",
}

function extractJadwal(keluhan: string) {
  const match = keluhan.match(/^Jadwal:\s*(.+)$/im)
  return match?.[1]?.trim()
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
    status_servis: { in: ["Konfirmasi Teknisi", "Dalam Pengecekan", "Perbaikan Unit"] },
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
    <div className="space-y-8 animate-fade-in font-outfit">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Jadwal Servis</h1>
            <p className="text-slate-500 font-medium text-base">Daftar giliran kunjungan dan perbaikan unit AC pelanggan.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border-0 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 hover:bg-transparent h-14">
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-8">Waktu & Jadwal</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Informasi Pelanggan</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Lokasi Tujuan</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-center">Status</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <JadwalTableBody rows={rows} />
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="p-8 bg-slate-50/20 border-t border-slate-50/50">
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

