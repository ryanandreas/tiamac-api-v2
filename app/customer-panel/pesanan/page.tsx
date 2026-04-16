import type { Metadata } from "next"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { startOfDay, endOfDay, parseISO } from "date-fns"
import { ServiceListTable } from "@/components/dashboard/service-list-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, Plus, Filter, Clock, CheckCircle2, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/pagination"

import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { SearchInput } from "@/components/dashboard/search-input"
import { OrderFilters } from "@/components/dashboard/order-filters"

export const metadata: Metadata = {
  title: "Pesanan Saya",
}

export default async function MyOrdersPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string; page?: string; q?: string; status?: string; date?: string }> 
}) {
  const user = await getCurrentUser()
  const { tab, page, q, status, date } = await searchParams
  const activeTab = tab === "history" ? "history" : "ongoing"
  const currentPage = parseInt(page || "1")
  const pageSize = 10

  const whereClause: any = {
    customerId: user.id,
    status_servis: activeTab === "ongoing" 
      ? { notIn: ["Selesai", "Dibatalkan", "Selesai (Garansi Aktif)"] }
      : { in: ["Selesai", "Dibatalkan", "Selesai (Garansi Aktif)"] },
  }

  // Add search filter if present
  if (q) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q)
    
    // Support searching by hex shorthand (e.g., #7A6ABC29 or 7A6ABC29)
    const hexMatch = q.match(/^#?([0-9a-fA-F]{8})$/)
    let foundIds: string[] = []
    
    if (hexMatch) {
      const hexPrefix = hexMatch[1].toLowerCase()
      try {
        // Cast UUID to text to allow prefix matching
        const rawResults = await db.$queryRaw<{ id: string }[]>`
          SELECT id FROM services 
          WHERE CAST(id AS TEXT) LIKE ${hexPrefix + '%'}
        `
        foundIds = rawResults.map(r => r.id)
      } catch (e) {
        console.error("Raw search error:", e)
      }
    }
    
    whereClause.OR = [
      ...(isUuid ? [{ id: q }] : []),
      ...(foundIds.length > 0 ? [{ id: { in: foundIds } }] : []),
      { keluhan: { contains: q, mode: 'insensitive' } },
      { jenis_servis: { contains: q, mode: 'insensitive' } },
    ]
  }

  // Add status filter if present
  if (status) {
    whereClause.status_servis = status
  }

  // Add date filter if present
  if (date) {
    try {
      const parsedDate = parseISO(date)
      if (!isNaN(parsedDate.getTime())) {
        whereClause.createdAt = {
          gte: startOfDay(parsedDate),
          lte: endOfDay(parsedDate),
        }
      }
    } catch (e) {
      console.error("Invalid date format:", date)
    }
  }

  const [services, ongoingCount, historyCount, filteredCount] = await Promise.all([
    db.services.findMany({
      where: whereClause,
      include: {
        customer: true,
        teknisi: true,
        acUnits: {
          include: {
            layanan: true,
          },
        },
        materialUsages: {
          include: {
            item: { select: { nama: true } },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    db.services.count({ where: { customerId: user.id, status_servis: { notIn: ["Selesai", "Dibatalkan", "Selesai (Garansi Aktif)"] } } }),
    db.services.count({ where: { customerId: user.id, status_servis: { in: ["Selesai", "Dibatalkan", "Selesai (Garansi Aktif)"] } } }),
    db.services.count({ where: whereClause }),
  ])
  
  const totalCount = filteredCount

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white px-6 py-4 rounded-3xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-none shadow-none">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Pesanan Saya</h1>
          <DynamicBreadcrumbs />
          <p className="text-slate-500 font-medium text-sm">Kelola semua pengerjaan servis Anda dalam satu panel kendali.</p>
        </div>
        <Link href="/booking">
          <Button className="h-11 px-6 rounded-2xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-bold text-xs shadow-none gap-2 transition-all">
            <Plus className="h-4 w-4" /> Pesan Servis Baru
          </Button>
        </Link>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="flex w-full max-w-md bg-white p-1 rounded-2xl h-12 shadow-none border-none mb-2">
          <TabsTrigger asChild value="ongoing" className="flex-1 rounded-xl font-semibold text-sm data-[state=active]:bg-green-50 data-[state=active]:text-[#66B21D] data-[state=active]:shadow-none transition-all gap-2">
            <Link href="/customer-panel/pesanan?tab=ongoing">
              <Clock className="h-4 w-4" /> Berjalan
              {ongoingCount > 0 && (
                <Badge className="h-5 px-2 bg-orange-500 hover:bg-orange-600 text-white border-none animate-pulse">
                  {ongoingCount}
                </Badge>
              )}
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="history" className="flex-1 rounded-xl font-semibold text-sm data-[state=active]:bg-green-50 data-[state=active]:text-[#66B21D] data-[state=active]:shadow-none transition-all gap-2">
            <Link href="/customer-panel/pesanan?tab=history">
              <CheckCircle2 className="h-4 w-4" /> Riwayat
              {historyCount > 0 && (
                <Badge className="h-5 px-2 bg-slate-200 text-slate-500 hover:bg-slate-300 border-none">
                  {historyCount}
                </Badge>
              )}
            </Link>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0 space-y-4">
          <Card className="border-none shadow-none overflow-hidden bg-white">
            <CardHeader className="px-6 pt-0 pb-4 border-none">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">Daftar {activeTab === "ongoing" ? "Pesanan Aktif" : "Riwayat Pesanan"}</CardTitle>
                  <CardDescription className="text-xs font-semibold text-slate-400 mt-1">
                    {activeTab === "ongoing" 
                      ? "Pantau progress pengerjaan teknisi secara real-time." 
                      : "Daftar pengerjaan yang sudah selesai atau dibatalkan."}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <SearchInput 
                    placeholder="Search" 
                    defaultValue={q} 
                  />
                  <OrderFilters type={activeTab as any} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {services.length > 0 ? (
                <div className="overflow-x-auto">
                   <ServiceListTable 
                     data={services} 
                     showNextStep={false} 
                     enableCustomerApproval={activeTab === "ongoing"} 
                     isCustomerView={true} 
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
                    <Clock className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Belum ada pesanan</h3>
                  <p className="text-sm text-slate-400 font-semibold max-w-xs mx-auto mt-2 leading-relaxed">
                    Sepertinya Anda belum memiliki daftar pesanan di bagian ini.
                  </p>
                  <Link href="/booking" className="mt-8">
                    <Button variant="outline" size="sm" className="h-11 px-8 rounded-xl font-bold text-xs border-slate-200 hover:border-[#66B21D] hover:text-[#66B21D] transition-all">Mulai Pesan Layanan</Button>
                  </Link>
                </div>
              )}
            </CardContent>
            
            {services.length > 0 && (
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-none pt-4">
                <p className="text-xs font-semibold text-slate-400">
                  Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} dari {totalCount} pesanan
                </p>
                <div>
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/customer-panel/pesanan"
                    searchParams={{ tab: activeTab, q, status }}
                  />
                </div>
              </div>
            )}
          </Card>

          {activeTab === "ongoing" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 border-none flex gap-4 shadow-none">
                <div className="size-10 rounded-2xl bg-green-50 flex items-center justify-center text-[#66B21D] shadow-none shrink-0 font-bold text-sm">1</div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">Pembayaran DP</p>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Lakukan pembayaran biaya kunjungan Rp 50.000 untuk konfirmasi jadwal kedatangan teknisi ke lokasi Anda.
                  </p>
                </div>
              </div>
              <div className="rounded-3xl bg-white p-6 border-none flex gap-4 shadow-none">
                <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-orange-600 shadow-none shrink-0 font-bold text-sm">2</div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">Pelunasan Servis</p>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Setelah servis selesai, silakan lakukan pelunasan biaya untuk mengaktifkan masa garansi pengerjaan selama 30 hari.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <Card className="border-none bg-[#66B21D] text-white shadow-none overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <CardContent className="p-6 relative z-10">
                <p className="text-xs font-bold text-white/80 flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4" /> Info Garansi
                </p>
                <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <p className="text-sm font-semibold leading-relaxed max-w-xl text-white">
                    Pengerjaan dengan status &quot;Selesai (Garansi Aktif)&quot; dapat diklaim jika terjadi masalah dalam 30 hari pengerjaan. Simpan Order ID Anda.
                  </p>
                  <Button variant="secondary" size="sm" className="h-10 px-6 rounded-xl font-bold text-xs text-[#66B21D] shrink-0">Pelajari Syarat & Ketentuan</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
