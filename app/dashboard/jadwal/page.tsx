import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, User, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function JadwalPage() {
  // Mock data for initial UI
  const schedules = [
    {
      id: "1",
      customer: "Ahmad",
      teknisi: "Budi",
      time: "09:00",
      type: "Service AC Split",
      address: "Jl. Merdeka No. 123",
      status: "Terkonfirmasi"
    },
    {
      id: "2",
      customer: "Siti",
      teknisi: "Cahyo",
      time: "13:00",
      type: "Cuci AC",
      address: "Komplek Perumahan Indah Blok A/5",
      status: "Dalam Perjalanan"
    }
  ]

  return (
    <SidebarInset>
      <DashboardHeader title="Jadwal Servis" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            <h2 className="text-2xl font-bold tracking-tight">Jadwal Servis</h2>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Jadwalkan Baru
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          {/* Calendar View Placeholder */}
          <Card className="md:col-span-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Maret 2026</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm">Hari Ini</Button>
                <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="h-[600px] flex items-center justify-center bg-muted/20 rounded-lg border border-dashed">
               <p className="text-muted-foreground">Calendar View Placeholder (FullCalendar integration recommended)</p>
            </CardContent>
          </Card>

          {/* Side Info */}
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Jadwal Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{schedule.time}</span>
                      </div>
                      <Badge variant="outline">{schedule.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">{schedule.type}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{schedule.customer} (Cust) / {schedule.teknisi} (Tek)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{schedule.address}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
