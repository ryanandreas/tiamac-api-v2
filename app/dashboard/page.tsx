import { getCurrentUser } from "@/app/actions/session"
import { db } from "@/lib/db"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  ClipboardList, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  Banknote,
  TrendingUp,
  Activity,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Settings
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import Link from "next/link"

export default async function Page() {
  const user = await getCurrentUser()
  
  if (!user.isAuthenticated) return null

  // If user is technician, we might want to redirect or show a different view
  const isTechnician =
    user.type === "staff" &&
    (user.role?.toLowerCase() === "teknisi")

  if (isTechnician) {
     const [activeTasks, completedTasks, pendingTasks] = await Promise.all([
       db.services.count({
         where: {
           teknisiId: user.id,
           status_servis: { in: ["Perbaikan Unit"] }
         }
       }),
       db.services.count({
         where: {
           teknisiId: user.id,
           status_servis: { in: ["Pekerjaan Selesai", "Selesai (Garansi Aktif)"] }
         }
       }),
       db.services.count({
         where: {
           teknisiId: user.id,
           status_servis: { in: ["Konfirmasi Teknisi", "Dalam Pengecekan", "Menunggu Persetujuan Customer"] }
         }
       })
     ])

     const techStats = [
       { title: "Tugas Berjalan", value: activeTasks, icon: Activity, color: "bg-green-50 text-[#66B21D]", desc: "Unit pengerjaan aktif" },
       { title: "Selesai", value: completedTasks, icon: CheckCircle2, color: "bg-blue-50 text-blue-600", desc: "Total kerja berhasil" },
       { title: "Antrean Cek", value: pendingTasks, icon: Briefcase, color: "bg-orange-50 text-orange-600", desc: "Menunggu pengecekan" },
     ]

     return (
       <div className="space-y-10 animate-fade-in">
            <div className="space-y-5">
              <DynamicBreadcrumbs />
              <div className="space-y-1 pl-1">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Halo, {user.name}! 👋</h1>
                <p className="text-slate-500 font-medium text-base">Selamat bertugas. Pantau semua penugasan servis Anda di sini secara efisien.</p>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
              {techStats.map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl flex flex-col gap-3 group transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl ${stat.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-600 tracking-tight leading-none mb-1.5">{stat.title}</p>
                      <p className="text-[10px] font-medium text-slate-400 leading-tight line-clamp-1">{stat.desc}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tighter">{stat.value}</h3>
                </div>
              ))}
            </div>
           
            <div className="grid gap-6 lg:grid-cols-2">
               <Card className="rounded-3xl border-none shadow-none overflow-hidden bg-white">
                 <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-12">
                   <div className="size-20 bg-green-50 rounded-3xl flex items-center justify-center mb-8 text-[#66B21D] shadow-inner">
                     <Wrench className="h-10 w-10" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">Mulai Pengerjaan<br/>Sekarang Secara Akurat</h3>
                   <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto mt-4 leading-relaxed">
                     Pastikan unit sudah dicek dan biaya sudah disetujui pelanggan sebelum menekan tombol mulai pengerjaan.
                   </p>
                   <Button className="mt-10 h-14 px-10 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#66B21D] transition-all group shadow-none border-none" asChild>
                     <Link href="/dashboard/tugas">
                       Buka Daftar Tugas <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                     </Link>
                   </Button>
                 </CardContent>
               </Card>

               <Card className="rounded-3xl border-none shadow-none overflow-hidden bg-slate-900 text-white relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Settings className="h-32 w-32" />
                  </div>
                  <CardHeader className="p-8">
                     <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Tips Kerja</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                     <div className="space-y-6">
                        <div className="flex gap-4">
                           <div className="size-6 rounded-full bg-[#66B21D] flex items-center justify-center shrink-0 text-white">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                           </div>
                           <p className="text-sm font-bold leading-relaxed">Gunakan perlengkapan safety lengkap saat bekerja di area outdoor.</p>
                        </div>
                        <div className="flex gap-4">
                           <div className="size-6 rounded-full bg-[#66B21D] flex items-center justify-center shrink-0 text-white">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                           </div>
                           <p className="text-sm font-bold leading-relaxed">Ambil foto unit sebelum dan sesudah diservis sebagai bukti valid.</p>
                        </div>
                        <div className="flex gap-4">
                           <div className="size-6 rounded-full bg-[#66B21D] flex items-center justify-center shrink-0 text-white">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                           </div>
                           <p className="text-sm font-bold leading-relaxed">Pastikan area kerja pelanggan kembali bersih setelah servis selesai.</p>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
       </div>
     )
  }

  // Admin Statistics
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [
     totalOrdersToday,
     servicesInProgress,
     pendingApproval,
     inventoryItems,
     totalRevenue
   ] = await Promise.all([
     db.services.count({
       where: {
         createdAt: {
           gte: startOfToday
         }
       }
     }),
     db.services.count({
       where: {
         status_servis: {
           in: ["Dalam Pengecekan", "Perbaikan Unit"]
         }
       }
     }),
     db.services.count({
       where: {
         status_servis: "Menunggu Persetujuan Customer"
       }
     }),
     db.inventoryItem.findMany({
       select: {
         id: true,
         qtyOnHand: true,
         minStock: true
       }
     }),
     db.services.aggregate({
       where: {
         status_servis: "Selesai (Garansi Aktif)"
       },
       _sum: {
         biaya: true
       }
     })
   ])

   const lowStockCount = inventoryItems.filter(item => item.qtyOnHand <= (item.minStock || 0)).length

  const stats = [
    {
      title: "Pesanan Hari Ini",
      value: totalOrdersToday,
      icon: ClipboardList,
      description: "Order baru masuk",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Servis Aktif",
      value: servicesInProgress,
      icon: Wrench,
      description: "Pengerjaan berjalan",
      color: "bg-orange-50 text-orange-600"
    },
    {
      title: "Menunggu Acc",
      value: pendingApproval,
      icon: Clock,
      description: "Konfirmasi biaya",
      color: "bg-yellow-50 text-yellow-600"
    },
    {
      title: "Stok Menipis",
      value: lowStockCount,
      icon: AlertTriangle,
      description: "Perlu restock item",
      color: "bg-red-50 text-red-600"
    },
    {
      title: "Total Omzet",
      value: formatPrice(totalRevenue._sum.biaya || 0),
      icon: Banknote,
      description: "Servis lunas hari ini",
      color: "bg-green-50 text-green-600"
    }
  ]

  return (
    <div className="space-y-10">
      <div className="space-y-5">
        <DynamicBreadcrumbs />
        <div className="space-y-1 pl-1">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Ringkasan Bisnis</h1>
          <p className="text-slate-500 font-medium text-base">Update statistik operasional Tiam AC secara real-time dan akurat.</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl flex flex-col gap-3 group transition-all">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl ${stat.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-600 tracking-tight leading-none mb-1.5">{stat.title}</p>
                <p className="text-[10px] font-medium text-slate-400 leading-tight line-clamp-1">{stat.description}</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-3xl overflow-hidden bg-white border-none shadow-none">
          <CardHeader className="pt-2 px-6 pb-3 flex flex-row items-center justify-between underline-none">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#66B21D]" /> Tren Pekerjaan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] flex flex-col items-center justify-center p-12 text-center">
            <div className="size-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
              <Activity className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-slate-400 max-w-xs">Grafik analisis performa akan muncul di sini secara periodik.</p>
          </CardContent>
        </Card>

        <Card className="col-span-3 rounded-3xl overflow-hidden bg-white border-none shadow-none">
          <CardHeader className="pt-2 px-6 pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#66B21D]" /> Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-4">
            <div className="flex flex-col">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                   <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                     <Clock className="h-4 w-4 text-slate-400" />
                   </div>
                   <div className="min-w-0 flex-1">
                     <p className="text-[13px] font-bold text-slate-900 line-clamp-1">Pembaruan status pesanan #AC-1928{i}</p>
                     <p className="text-[11px] text-slate-400 font-bold mt-0.5">10 menit yang lalu</p>
                   </div>
                   <ArrowRight className="h-3.5 w-3.5 text-slate-200 shrink-0" />
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
