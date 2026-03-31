import { db } from "@/lib/db"
import { SiteNavbar } from "@/components/site-navbar"
import FooterSection from "@/components/footer"
import { getCurrentUser } from "@/app/actions/session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function HargaPage() {
  const current = await getCurrentUser()

  const catalog = await db.acServiceCatalog.findMany({
    orderBy: [
      { nama: 'asc' },
      { pk: 'asc' }
    ]
  })

  // Group by service name
  const groupedServices: Record<string, typeof catalog> = {}
  catalog.forEach(item => {
    if (!groupedServices[item.nama]) {
      groupedServices[item.nama] = []
    }
    groupedServices[item.nama].push(item)
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-green-100/15 to-slate-200/40">
      <SiteNavbar user={current} mode="sticky" />

      <main className="mx-auto max-w-5xl px-6 py-16 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Daftar Harga Layanan
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Tarif transparan dan kompetitif untuk semua kebutuhan perawatan AC Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {Object.entries(groupedServices).map(([serviceName, items]) => (
            <Card key={serviceName} className="rounded-3xl border-slate-100 bg-white shadow-none overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100 py-2">
                <CardTitle className="text-xl font-bold text-slate-900">{serviceName}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="font-bold text-slate-900 h-12 px-6">Kapasitas AC (PK)</TableHead>
                      <TableHead className="font-bold text-slate-900 h-12 px-6 text-right">Harga</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {items.map((item) => (
                      <TableRow key={item.uuid} className="hover:bg-transparent border-slate-100">
                        <TableCell className="px-6 py-4 font-medium text-slate-600">
                          {item.pk ? `${item.pk} PK` : "Semua Ukuran"}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right font-bold text-[#66B21D]">
                          Rp {item.harga.toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mt-16 overflow-hidden bg-linear-to-br from-green-500/10 via-green-50/50 to-white rounded-[2.5rem] p-8 md:p-12 border border-green-200">
          <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-green-100/30 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Butuh Layanan Custom?</h3>
              <p className="text-slate-600 font-medium">
                Kami juga melayani proyek instalasi besar atau perawatan gedung dan kantor dengan penawaran harga khusus.
              </p>
            </div>
            <a
              href="https://wa.me/628123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-linear-to-r from-[#66B21D] to-[#4d9e0f] text-white font-bold rounded-2xl hover:scale-105 active:scale-95 shadow-lg shadow-[#66B21D]/20 transition-all"
            >
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
