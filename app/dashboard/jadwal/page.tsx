import type { Metadata } from "next"
import { SchedulingTable } from "@/components/dashboard/scheduling-table"
import { db } from "@/lib/db"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Calendar } from "lucide-react"
import { Pagination } from "@/components/pagination"

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
      role: { in: ["karyawan", "teknisi"] },
    },
    include: { user: { select: { id: true, name: true } } },
  })

  const teknisi = teknisiProfiles.map((row) => row.user)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-4">
        <DynamicBreadcrumbs />
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Jadwal Perbaikan</h1>
          <p className="text-slate-500 font-medium text-base">Tetapkan teknisi dan jadwal untuk pesanan baru yang telah dikonfirmasi.</p>
        </div>
      </div>
      </div>

      <div className="bg-white rounded-2xl border-0 shadow-none overflow-hidden">
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
