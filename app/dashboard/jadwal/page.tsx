import { SchedulingTable } from "@/components/dashboard/scheduling-table"
import { db } from "@/lib/db"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Calendar } from "lucide-react"
import { Pagination } from "@/components/pagination"

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
      role: { in: ["karyawan", "teknisi"] },
    },
    include: { user: { select: { uuid: true, name: true } } },
  })

  const teknisi = teknisiProfiles.map((row) => row.user)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-xl bg-green-50 flex items-center justify-center text-[#66B21D]">
              <Calendar className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-black text-[#66B21D] uppercase tracking-widest">Penjadwalan</h1>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Jadwal Perbaikan</h2>
          <DynamicBreadcrumbs />
          <p className="text-slate-500 font-bold text-sm mt-1">Tetapkan teknisi dan jadwal untuk pesanan baru yang telah dikonfirmasi.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="p-1">
          <SchedulingTable data={services} teknisi={teknisi} />
        </div>
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 bg-slate-50/20">
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
