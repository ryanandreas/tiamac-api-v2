import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { SiteNavbar } from "@/components/site-navbar"
import { CustomerPanelNav } from "@/components/customer-panel-nav"
import { CustomerProfileForm } from "@/components/customer-profile-form"

const ONGOING_STATUSES = [
  "Booking",
  "Menunggu Jadwal",
  "Teknisi Dikonfirmasi",
  "Dalam Pengecekan",
  "Menunggu Persetujuan Customer",
  "Sedang Dikerjakan",
  "Pekerjaan Selesai",
  "Menunggu Pembayaran",
]

const HISTORY_STATUSES = ["Selesai (Garansi Aktif)", "Selesai", "Dibatalkan"]

export default async function ProfilCustPage() {
  const current = await getCurrentUser()
  if (!current.isAuthenticated || current.type !== "customer") {
    redirect("/login")
  }

  const user = await db.users.findUnique({
    where: { uuid: current.id },
    select: {
      name: true,
      email: true,
      customerProfile: { select: { no_telp: true, provinsi: true, alamat: true } },
    },
  })

  if (!user || !user.customerProfile) {
    redirect("/login")
  }

  const customer = {
    name: user.name,
    email: user.email,
    no_telp: user.customerProfile.no_telp,
    provinsi: user.customerProfile.provinsi,
    alamat: user.customerProfile.alamat,
  }

  const [ongoingCount, historyCount] = await Promise.all([
    db.services.count({ where: { customerId: current.id, status_servis: { in: ONGOING_STATUSES } } }),
    db.services.count({ where: { customerId: current.id, status_servis: { in: HISTORY_STATUSES } } }),
  ])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar user={current} mode="sticky" />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <aside className="md:col-span-3">
            <CustomerPanelNav active="profile" ongoingCount={ongoingCount} historyCount={historyCount} />
          </aside>

          <div className="md:col-span-9">
            <CustomerProfileForm initialValues={customer} />
          </div>
        </div>
      </main>
    </div>
  )
}
