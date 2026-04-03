import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { FileText, Download, TrendingUp, BarChart3, PieChart, User } from "lucide-react"
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
      icon: User,
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Laporan Sistem</h1>
            <p className="text-slate-500 font-medium text-base">Pantau performa bisnis dan operasional melalui laporan terpusat.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report, index) => (
          <Card key={index} className="rounded-2xl border-0 shadow-none bg-white overflow-hidden group">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-6">
              <div className={`p-3 rounded-xl ${report.bg} transition-transform group-hover:scale-110`}>
                <report.icon className={`h-6 w-6 ${report.color}`} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6 pt-0">
              <p className="text-sm font-medium text-slate-500 leading-relaxed">{report.description}</p>
              <div className="flex items-center gap-3">
                <Button className="flex-1 rounded-xl bg-slate-900 hover:bg-[#66B21D] text-white font-bold text-xs h-10 border-none shadow-none transition-all active:scale-95">
                  <FileText className="mr-2 h-4 w-4" />
                  Lihat Data
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl border-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs h-10 transition-all">
                  <Download className="mr-2 h-4 w-4" />
                  Ekspor
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
