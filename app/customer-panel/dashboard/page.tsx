import type { Metadata } from "next"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, CreditCard, Package, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react"

const ONGOING_STATUSES = [
  "Menunggu Jadwal",
  "Teknisi Dikonfirmasi",
  "Dalam Pengecekan",
  "Menunggu Persetujuan Customer",
  "Sedang Dikerjakan",
  "Pekerjaan Selesai",
  "Menunggu Pembayaran",
]

const HISTORY_STATUSES = ["Selesai (Garansi Aktif)", "Selesai", "Dibatalkan"]

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser()
  const displayName = user.isAuthenticated && "name" in user ? user.name : "Customer"

  const activeServices = await db.services.findMany({
    where: {
      customerId: user.id,
      status_servis: { in: ["Booking", ...ONGOING_STATUSES] },
    },
    include: {
      acUnits: {
        include: {
          layanan: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 3,
  })

  const stats = {
    ongoing: await db.services.count({
      where: { customerId: user.id, status_servis: { in: ["Booking", ...ONGOING_STATUSES] } },
    }),
    unpaid: await db.services.count({
      where: {
        customerId: user.id,
        status_servis: { in: ["Booking", "Menunggu Pembayaran"] },
      },
    }),
    completed: await db.services.count({
      where: { customerId: user.id, status_servis: { in: HISTORY_STATUSES } },
    }),
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Halo, {displayName}! 👋</h1>
        <p className="text-slate-500 font-bold text-sm">Selamat datang kembali. Berikut ringkasan aktivitas servis AC Anda.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: "Pesanan Aktif", value: stats.ongoing, icon: Clock, color: "bg-green-100 text-[#66B21D]", desc: "Sedang diproses" },
          { label: "Belum Dibayar", value: stats.unpaid, icon: CreditCard, color: "bg-orange-100 text-orange-600", desc: "Butuh tindakan" },
          { label: "Total Selesai", value: stats.completed, icon: Package, color: "bg-blue-100 text-blue-600", desc: "Riwayat servis" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-none overflow-hidden group py-0 gap-0">
            <CardContent className="p-6 pt-8 relative">
              <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon className="h-6 w-6" />
                 </div>
                 <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-slate-100">Summary</Badge>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
              <p className="text-sm font-bold text-slate-400 mb-1">{stat.label}</p>
              <div className="text-[11px] font-black text-[#66B21D] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                {stat.desc} <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Widgets */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Ongoing Orders Widget */}
        <Card className="border-none shadow-none overflow-hidden py-0 gap-0 bg-white">
          <CardHeader className="p-6 border-none flex flex-row items-center justify-between pt-8 pb-4">
            <div>
              <CardTitle className="text-lg font-black text-slate-900">Pesanan Aktif</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Progress pengerjaan</CardDescription>
            </div>
            <Link href="/customer-panel/pesanan?tab=ongoing">
              <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-black text-[#66B21D] hover:bg-green-50 rounded-xl gap-2 transition-all">
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {activeServices.length > 0 ? (
              activeServices.map((service) => (
                <Link key={service.id} href={`/customer-panel/pesanan/${service.id}`}>
                  <div className="group flex items-center gap-4 rounded-2xl border-none p-4 hover:bg-green-50/30 transition-all duration-300">
                    <div className="size-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shrink-0 group-hover:bg-[#66B21D] transition-colors">
                      {service.id.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-black text-slate-900 truncate">#{service.id.slice(0, 8).toUpperCase()}</p>
                        <Badge 
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border-none ${
                            service.status_servis === "Menunggu Pembayaran" || service.status_servis === "Booking" 
                            ? "bg-orange-100 text-orange-600" 
                            : "bg-green-100 text-[#66B21D]"
                          }`}
                        >
                          {service.status_servis}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-bold truncate">
                        {service.keluhan || "Servis AC Routine"}
                      </p>
                    </div>
                    <div className="size-8 rounded-full border-none flex items-center justify-center text-slate-300 group-hover:text-[#66B21D] transition-all">
                        <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="size-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 text-slate-200">
                    <Package className="h-10 w-10" />
                </div>
                <p className="text-sm text-slate-900 font-black mb-1">Tidak ada pesanan aktif</p>
                <p className="text-xs text-slate-400 font-bold mb-6">Mulai dengan memesan servis baru</p>
                <Link href="/booking">
                  <Button size="sm" className="h-10 px-6 rounded-xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-xs shadow-lg shadow-green-500/20">
                    Pesan Servis Baru
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Widget */}
        <Card className="border-none shadow-none overflow-hidden py-0 gap-0 bg-white">
          <CardHeader className="p-6 border-none pt-8 pb-4">
            <CardTitle className="text-lg font-black text-slate-900">Notifikasi</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Update status & info</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {stats.unpaid > 0 && (
              <div className="flex gap-4 p-5 rounded-3xl bg-orange-50 border-none items-start">
                <div className="size-10 rounded-2xl bg-white flex items-center justify-center text-orange-600 shadow-none shrink-0">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 mb-1">Pembayaran Tertunda</p>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed mb-4">
                    Ada {stats.unpaid} pesanan yang menunggu pembayaran awal atau pelunasan. Segera selesaikan untuk melanjutkan proses.
                  </p>
                  <Link href="/customer-panel/billing">
                    <Button size="sm" className="h-9 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs">
                      Bayar Sekarang
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            
            <div className="flex gap-4 items-start p-2">
              <div className="size-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900 mb-1">Tips Perawatan AC</p>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  Servis cuci AC rutin setiap 3-4 bulan sekali untuk menjaga efisiensi dan kebersihan udara ruangan Anda.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-2">
              <div className="size-10 rounded-2xl bg-green-50 flex items-center justify-center text-[#66B21D] shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900 mb-1">Jaminan Garansi Tiamac</p>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  Setiap pengerjaan teknisi profesional kami memiliki jaminan garansi selama 30 hari penuh sejak servis selesai.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
