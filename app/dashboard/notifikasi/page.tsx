import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
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
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Notifikasi Sistem</h1>
            <p className="text-slate-500 font-medium text-base">Pembaruan terkini dan peringatan dari seluruh aktivitas sistem.</p>
          </div>
        </div>
        <Button variant="outline" className="h-10 px-5 rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-none">
          Tandai Semua Dibaca
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <Card key={notif.id} className="rounded-2xl border-0 shadow-none bg-white hover:bg-slate-50/50 transition-all cursor-pointer group">
            <CardContent className="p-5 flex items-start gap-5">
              <div className={`p-3 rounded-xl ${notif.bg} shrink-0 transition-transform group-hover:scale-110`}>
                <notif.icon className={`h-5 w-5 ${notif.color}`} />
              </div>
              <div className="flex-1 space-y-1 mt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-bold text-slate-900 leading-tight">{notif.title}</h4>
                  <span className="text-[11px] font-bold text-slate-400">{notif.time}</span>
                </div>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{notif.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="text-center pt-8">
          <Button variant="ghost" className="rounded-xl text-xs font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">Lihat Notifikasi Lama</Button>
        </div>
      </div>
    </div>
  )
}
