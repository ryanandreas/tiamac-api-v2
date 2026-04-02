import { getCurrentUser } from "@/app/actions/session"
import { db } from "@/lib/db"
import { SiteNavbar } from "@/components/site-navbar"
import { AcBookingForm } from "@/components/ac-booking-form"

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
    <div className="min-h-screen bg-background">
      <SiteNavbar user={current} mode="sticky" />
      <main className="mx-auto w-full py-6">
        <AcBookingForm catalogRows={catalogRows} currentUser={current} />
      </main>
    </div>
  )
}
