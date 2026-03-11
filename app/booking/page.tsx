import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/session"
import { db } from "@/lib/db"
import { SiteNavbar } from "@/components/site-navbar"
import { AcBookingForm } from "@/components/ac-booking-form"

export default async function BookingPage() {
  const current = await getCurrentUser()
  if (!current.isAuthenticated || current.type !== "customer") {
    redirect("/login")
  }

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
      <main className="mx-auto max-w-4xl px-4 py-6 md:px-8">
        <AcBookingForm catalogRows={catalogRows} />
      </main>
    </div>
  )
}
