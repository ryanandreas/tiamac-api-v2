import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { FileText, Download, TrendingUp, BarChart3, PieChart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LaporanPage() {
  const reports = [
    {
      title: "Laporan Pendapatan",
      description: "Ringkasan total pendapatan bulanan dan tahunan.",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Laporan Penggunaan Sparepart",
      description: "Data barang inventory yang paling sering digunakan.",
      icon: BarChart3,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Laporan Performa Teknisi",
      description: "Statistik penyelesaian tugas dan rating per teknisi.",
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      title: "Laporan Kepuasan Pelanggan",
      description: "Analisis feedback dan rating dari customer.",
      icon: PieChart,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ]

  return (
    <SidebarInset>
      <DashboardHeader title="Laporan & Analisis" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h2 className="text-2xl font-bold tracking-tight">Laporan Sistem</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {reports.map((report, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className={`p-2 rounded-lg ${report.bg}`}>
                  <report.icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{report.description}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Lihat Laporan
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF/Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SidebarInset>
  )
}
