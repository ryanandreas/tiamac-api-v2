import type { Metadata } from "next"
import { db } from "@/lib/db"
import { Truck, CheckCircle2 } from "lucide-react"
import { getCurrentUser } from "@/app/actions/session"
import { redirect } from "next/navigation"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Pagination } from "@/components/pagination"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OngoingTableBody } from "./ongoing-table-body"

export const metadata: Metadata = {
  title: "Ongoing Servis",
}

export default async function OngoingServisPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; msg?: string }>
}) {
  const user = await getCurrentUser()
  if (
    !user.isAuthenticated ||
    user.type !== "staff" ||
    user.role?.toLowerCase() !== "teknisi"
  ) {
    redirect("/dashboard")
  }

  const { page, msg } = await searchParams
  const isConfirmed = msg === "confirmed"
  const isCompleted = msg === "completed"
  const currentPage = Number(page) || 1
  const pageSize = 10
  const skip = (currentPage - 1) * pageSize

  // Step 4 to Step 7 as requested to show all technician work already accepted
  const statusOngoing = [
    "Pengecekan Unit", 
    "Menunggu Persetujuan Customer", 
    "Perbaikan Unit", 
    "Menunggu Pembayaran"
  ]

  const whereClause = {
    teknisiId: user.id,
    status_servis: { in: statusOngoing }
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
    <div className="space-y-8 animate-fade-in font-outfit">
      {isConfirmed && (
        <div className="bg-[#66B21D]/10 border border-[#66B21D]/20 p-4 rounded-2xl flex items-center gap-3 animate-slide-up">
           <div className="size-10 rounded-xl bg-[#66B21D] text-white flex items-center justify-center shadow-lg shadow-green-500/20">
              <CheckCircle2 className="size-5" />
           </div>
           <div>
              <p className="text-sm font-black text-slate-900">Pekerjaan Berhasil Dikonfirmasi</p>
              <p className="text-[11px] font-bold text-slate-500">Status pesanan telah diperbarui ke Pengecekan Unit. Selamat bekerja!</p>
           </div>
        </div>
      )}

      {isCompleted && (
        <div className="bg-[#66B21D]/10 border border-[#66B21D]/20 p-4 rounded-2xl flex items-center gap-3 animate-slide-up">
           <div className="size-10 rounded-xl bg-[#66B21D] text-white flex items-center justify-center shadow-lg shadow-green-500/20">
              <CheckCircle2 className="size-5" />
           </div>
           <div>
              <p className="text-sm font-black text-slate-900">Laporan Pengerjaan Terkirim</p>
              <p className="text-[11px] font-bold text-slate-500">Data pengerjaan telah berhasil disimpan. Pelanggan akan segera menerima notifikasi pelunasan.</p>
           </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Ongoing Servis</h1>
            <p className="text-slate-500 font-medium text-base">Pantau semua pekerjaan yang sedang aktif, mulai dari pengecekan hingga proses pengerjaan.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border-0 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 hover:bg-transparent h-14">
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-8">Order ID</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Jadwal & Unit</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Pelanggan</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-center">Status Tracking</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <OngoingTableBody services={services} />
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="p-8 bg-slate-50/20 border-t border-slate-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/dashboard/ongoing"
            />
          </div>
        )}
      </div>
    </div>
  )
}
