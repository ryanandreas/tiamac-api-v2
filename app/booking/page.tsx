import { getCurrentUser } from "@/app/actions/session"
import { db } from "@/lib/db"
import { SiteNavbar } from "@/components/site-navbar"
import { AcBookingForm } from "@/components/ac-booking-form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function BookingPage() {
  const current = await getCurrentUser()

  let catalogRows: Array<{ nama: string; pk: string | null; harga: number }> = []
  try {
    catalogRows = await db.acServiceCatalog.findMany({
      select: { nama: true, pk: true, harga: true },
      orderBy: [{ nama: "asc" }, { pk: "asc" }],
    })
  } catch {
    catalogRows = []
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]/50">
      <SiteNavbar user={current} mode="sticky" />
      <main className="mx-auto w-full max-w-[1200px] px-4 lg:px-0 py-8 space-y-6">
        <div className="animate-fade-in">
          <Card className="rounded-3xl border-none shadow-none bg-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-[#66B21D] transition-all">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Booking Servis</h1>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-4">Tiam AC - Professional Service</p>
            </div>
          </Card>
        </div>
        <AcBookingForm catalogRows={catalogRows} currentUser={current} />
      </main>
    </div>
  )
}
