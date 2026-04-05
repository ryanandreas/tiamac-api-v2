import type { Metadata } from "next"
import { SchedulingTable } from "@/components/dashboard/scheduling-table"
import { db } from "@/lib/db"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Calendar, Search, Filter } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Atur Jadwal",
}

export default async function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  const skip = (currentPage - 1) * pageSize

  const [services, totalCount] = await Promise.all([
    db.services.findMany({
      where: {
        status_servis: "Menunggu Jadwal",
      },
      include: {
        customer: { include: { customerProfile: true } },
        teknisi: true,
        acUnits: { include: { layanan: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),
    db.services.count({
      where: {
        status_servis: "Menunggu Jadwal",
      },
    })
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  const teknisiProfiles = await db.staffProfile.findMany({
    where: {
      role: "teknisi",
    },
    include: { user: { select: { id: true, name: true } } },
  })

  const teknisi = teknisiProfiles.map((row) => row.user)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Jadwal Perbaikan</h1>
            <p className="text-slate-500 font-medium text-base">Tetapkan teknisi dan jadwal untuk pesanan baru yang telah dikonfirmasi.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-0 shadow-none overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors pointer-events-none" />
            <Input
              placeholder="Cari jadwal..."
              className="pl-10 h-10 text-[11px] font-semibold border-slate-100 rounded-xl focus-visible:ring-[#66B21D] shadow-none placeholder:text-slate-300 bg-slate-50/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10 border-slate-100 rounded-xl text-slate-400 hover:text-[#66B21D] hover:bg-green-50 transition-all">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-0">
          <SchedulingTable data={services} teknisi={teknisi} />
        </div>
        {totalPages > 1 && (
          <div className="p-6 bg-slate-50/20">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/dashboard/jadwal"
            />
          </div>
        )}
      </div>
    </div>
  )
}
