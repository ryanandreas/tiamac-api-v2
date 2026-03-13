import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { Bell, CheckCircle2, Clock, Package, Wrench, User, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function NotifikasiPage() {
  const notifications = [
    {
      id: "1",
      title: "Booking Baru",
      message: "Customer Ahmad melakukan booking servis AC untuk tanggal 15 Maret 2026.",
      time: "5 menit yang lalu",
      icon: Clock,
      type: "booking",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      id: "2",
      title: "Stok Menipis",
      message: "Stok 'Freon R32' tersisa 2 tabung. Segera lakukan pengadaan.",
      time: "1 jam yang lalu",
      icon: AlertTriangle,
      type: "inventory",
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      id: "3",
      title: "Pekerjaan Selesai",
      message: "Teknisi Budi telah menyelesaikan servis #SERV-12345.",
      time: "3 jam yang lalu",
      icon: CheckCircle2,
      type: "service",
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ]

  return (
    <SidebarInset>
      <DashboardHeader title="Notifikasi" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            <h2 className="text-2xl font-bold tracking-tight">Notifikasi Sistem</h2>
          </div>
          <Button variant="outline" size="sm">Tandai Semua Dibaca</Button>
        </div>

        <div className="space-y-4 max-w-3xl">
          {notifications.map((notif) => (
            <Card key={notif.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`p-2 rounded-lg ${notif.bg} shrink-0`}>
                  <notif.icon className={`h-5 w-5 ${notif.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{notif.title}</h4>
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="text-center py-8">
            <Button variant="ghost" className="text-muted-foreground">Lihat Notifikasi Lama</Button>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
