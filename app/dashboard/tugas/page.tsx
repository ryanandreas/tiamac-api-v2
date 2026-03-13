import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/app/actions/session"
import { db } from "@/lib/db"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, User, Clock, Phone, ArrowRight, Briefcase } from "lucide-react"

export default async function TugasTeknisiPage() {
  const user = await getCurrentUser()
  
  const tasks = await db.services.findMany({
    where: {
      teknisiId: user.id,
      status_servis: {
        in: ["Teknisi Dikonfirmasi", "Dalam Pengecekan", "Sedang Dikerjakan"]
      }
    },
    include: {
      customer: {
        include: {
          customerProfile: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  })

  return (
    <SidebarInset>
      <DashboardHeader title="Tugas Saya" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6" />
          <h2 className="text-2xl font-bold tracking-tight">Tugas Servis</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.length === 0 ? (
            <div className="col-span-full py-20 text-center border rounded-lg bg-muted/20 border-dashed">
              <p className="text-muted-foreground">Tidak ada tugas aktif saat ini.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-background">{task.status_servis}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(task.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <CardTitle className="text-lg">{task.jenis_servis}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {task.customer.customerProfile?.alamat || "Alamat tidak tersedia"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{task.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{task.customer.customerProfile?.no_telp || "-"}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm italic">
                    "{task.keluhan}"
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button className="w-full">
                    Mulai Kerjakan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </SidebarInset>
  )
}
