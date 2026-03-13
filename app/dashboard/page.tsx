import { getCurrentUser } from "@/app/actions/session"
import { SidebarInset } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
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
  Activity
} from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default async function Page() {
  const user = await getCurrentUser()
  
  if (!user.isAuthenticated) return null

  // If user is technician/karyawan, we might want to redirect or show a different view
  const isTechnician = user.role?.toLowerCase() === "teknisi" || user.role?.toLowerCase() === "karyawan"

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
       <SidebarInset>
         <DashboardHeader title="Technician Dashboard" />
         <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Tugas Hari Ini</CardTitle>
                 <Briefcase className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">{tasksCount}</div>
                 <p className="text-xs text-muted-foreground">Tugas yang perlu dikerjakan hari ini</p>
               </CardContent>
             </Card>
            {/* Add more technician stats here */}
          </div>
          <div className="mt-4 p-6 bg-muted/50 rounded-xl border border-dashed flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-lg font-semibold">Selamat Datang, {user.name}</h3>
            <p className="text-sm text-muted-foreground">Gunakan menu di samping untuk melihat tugas dan jadwal Anda.</p>
          </div>
        </div>
      </SidebarInset>
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
      title: "Total Pesanan Hari Ini",
      value: totalOrdersToday,
      icon: ClipboardList,
      description: "Pesanan baru yang masuk hari ini",
      color: "text-blue-600"
    },
    {
      title: "Servis Berjalan",
      value: servicesInProgress,
      icon: Wrench,
      description: "Unit yang sedang dikerjakan teknisi",
      color: "text-orange-600"
    },
    {
      title: "Menunggu Persetujuan",
      value: pendingApproval,
      icon: Clock,
      description: "Menunggu konfirmasi biaya dari customer",
      color: "text-yellow-600"
    },
    {
      title: "Stok Menipis",
      value: lowStockCount,
      icon: AlertTriangle,
      description: "Barang inventory di bawah stok minimum",
      color: "text-red-600"
    },
    {
      title: "Total Pendapatan",
      value: formatPrice(totalRevenue._sum.biaya || 0),
      icon: DollarSign,
      description: "Total pendapatan dari servis selesai",
      color: "text-green-600"
    }
  ]

  return (
    <SidebarInset>
      <DashboardHeader title="Admin Dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tren Servis
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg border border-dashed">
              <p className="text-muted-foreground">Grafik Tren Servis akan tampil di sini</p>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Aktivitas Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada aktivitas terbaru</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}

function Briefcase(props: any) {
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
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  )
}
