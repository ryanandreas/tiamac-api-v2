import Link from "next/link"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { SiteNavbar } from "@/components/site-navbar"
import { CustomerProfileForm } from "@/components/customer-profile-form"

export default async function ProfilCustPage() {
  const current = await getCurrentUser()
  if (!current.isAuthenticated || current.type !== "customer") {
    redirect("/login")
  }

  const customer = await db.customers.findUnique({
    where: { uuid: current.id },
    select: {
      name: true,
      email: true,
      no_telp: true,
      provinsi: true,
      alamat: true,
    },
  })

  if (!customer) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar user={current} mode="sticky" />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <aside className="md:col-span-3">
            <nav className="space-y-1 rounded-lg border bg-card p-2">
              <Link
                href="/listpesanan"
                className="block rounded px-3 py-2 text-sm hover:bg-muted/60"
              >
                Pesanan
              </Link>
              <Link
                href="/listpesanan?tab=history"
                className="block rounded px-3 py-2 text-sm hover:bg-muted/60"
              >
                History
              </Link>
              <Link
                href="/profilcust"
                className="block rounded px-3 py-2 text-sm bg-muted font-medium"
              >
                Profile
              </Link>
            </nav>
          </aside>

          <div className="md:col-span-9">
            <CustomerProfileForm initialValues={customer} />
          </div>
        </div>
      </main>
    </div>
  )
}

