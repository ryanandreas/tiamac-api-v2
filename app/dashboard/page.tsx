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
  DollarSign,
  TrendingUp,
  Activity,
  Briefcase,
  ArrowRight
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"

export default async function Page() {
  const user = await getCurrentUser()
  
  if (!user.isAuthenticated) return null

  // If user is technician/karyawan, we might want to redirect or show a different view
  const isTechnician =
    user.type === "staff" &&
    (user.role?.toLowerCase() === "teknisi" || user.role?.toLowerCase() === "karyawan")

  if (isTechnician) {
     const tasksCount = await db.services.count({
       where: {
         teknisiId: user.id,
         status_servis: {
           in: ["Teknisi Dikonfirmasi", "Dalam Pengecekan", "Sedang Dikerjakan"]
         }
       }
     })

     return (
       <div className="space-y-8">
           <div className="flex flex-col gap-1">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Halo, {user.name}!</h1>
             <p className="text-slate-500 font-bold text-sm">Semangat kerja hari ini. Berikut update tugas Anda.</p>
           </div>

           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden group">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-slate-50/50">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Tugas Aktif</CardTitle>
                 <Briefcase className="h-5 w-5 text-[#66B21D]" />
               </CardHeader>
               <CardContent className="pt-6">
                 <div className="text-4xl font-black text-slate-900 tracking-tighter">{tasksCount}</div>
                 <p className="text-xs font-bold text-slate-400 mt-2">Unit yang perlu ditangani hari ini</p>
               </CardContent>
             </Card>
           </div>
           
           <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
             <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-12">
               <div className="size-20 bg-green-50 rounded-3xl flex items-center justify-center mb-8 text-[#66B21D]">
                 <Activity className="h-10 w-10" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Monitor Tugas Secara Real-time</h3>
               <p className="text-sm text-slate-400 font-bold max-w-md mx-auto mt-3 leading-relaxed">
                 Gunakan menu navigasi di samping untuk melihat detail jadwal, input pengerjaan, dan riwayat tugas Anda.
               </p>
               <Button className="mt-10 h-12 px-8 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-[#66B21D] transition-all shadow-lg shadow-slate-900/10">
                 Lihat Jadwal Saya
               </Button>
             </CardContent>
           </Card>
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
           in: ["Dalam Pengecekan", "Sedang Dikerjakan"]
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
      icon: DollarSign,
      description: "Servis lunas hari ini",
      color: "bg-green-50 text-green-600"
    }
  ]

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ringkasan Bisnis</h1>
        <DynamicBreadcrumbs />
        <p className="text-slate-500 font-bold text-sm mt-1">Update statistik operasional Tiam AC secara real-time.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-xl shadow-slate-200/50 overflow-hidden group hover:-translate-y-1 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-slate-50/30">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.title}</CardTitle>
              <div className={`size-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#66B21D]" /> Tren Pekerjaan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] flex flex-col items-center justify-center bg-slate-50/30 p-12 text-center">
            <div className="size-16 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 text-slate-200">
              <Activity className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-slate-400 max-w-xs">Grafik analisis performa akan muncul di sini secara periodik.</p>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-50">
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#66B21D]" /> Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="p-6 flex gap-4 hover:bg-slate-50/50 transition-colors">
                   <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                     <Clock className="h-5 w-5 text-slate-400" />
                   </div>
                   <div className="min-w-0 flex-1">
                     <p className="text-xs font-black text-slate-900 line-clamp-1">Pembaruan status pesanan #AC-1928{i}</p>
                     <p className="text-[11px] text-slate-400 font-bold mt-1">10 menit yang lalu</p>
                   </div>
                   <ArrowRight className="h-4 w-4 text-slate-200 shrink-0" />
                 </div>
               ))}
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-50">
              <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#66B21D] gap-2">
                Lihat Semua Aktivitas <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
