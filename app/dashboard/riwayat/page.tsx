import type { Metadata } from "next"
import { db } from "@/lib/db"
import { History } from "lucide-react"
import { getCurrentUser } from "@/app/actions/session"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Pagination } from "@/components/pagination"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RiwayatTableBody } from "./riwayat-table-body"

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
      in: ["Pekerjaan Selesai", "Menunggu Pembayaran", "Selesai", "Selesai (Garansi Aktif)"]
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
    <div className="space-y-8 animate-fade-in font-outfit">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Riwayat Kerja</h1>
            <p className="text-slate-500 font-medium text-base">Daftar semua pekerjaan servis yang telah Anda selesaikan.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border-0 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 hover:bg-transparent h-14">
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-8">ID Servis</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Pelanggan</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Layanan</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Tgl Selesai</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <RiwayatTableBody tasks={tasks} />
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="p-8 bg-slate-50/20 border-t border-slate-50/50">
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
