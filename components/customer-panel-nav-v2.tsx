"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Clock, CheckCircle2, CreditCard, Settings } from "lucide-react"

export function CustomerPanelNavV2({
  ongoingCount,
  historyCount,
  unpaidCount,
}: {
  ongoingCount?: number
  historyCount?: number
  unpaidCount?: number
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab")

  const isActive = (path: string) => {
    const [basePath, query] = path.split("?")
    const pathSearchParams = new URLSearchParams(query)
    const pathTab = pathSearchParams.get("tab")

    if (pathname !== basePath) return false
    if (pathTab && currentTab !== pathTab) return false
    return true
  }

  const linkClass = (path: string) =>
    `flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      isActive(path)
        ? "bg-primary text-primary-foreground font-medium shadow-sm"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`

  return (
    <nav className="space-y-1 rounded-2xl border-none bg-white p-2 shadow-none">
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Utama
      </div>
      <Link href="/customer-panel/dashboard" className={linkClass("/customer-panel/dashboard")}>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </div>
      </Link>

      <div className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Pesanan Saya
      </div>
      <Link href="/customer-panel/pesanan" className={linkClass("/customer-panel/pesanan")}>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Daftar Pesanan</span>
        </div>
        {typeof ongoingCount === "number" && ongoingCount > 0 ? (
          <Badge
            variant={isActive("/customer-panel/pesanan") ? "secondary" : "default"}
            className="h-5 px-1.5 min-w-[1.25rem] flex items-center justify-center font-normal"
          >
            {ongoingCount}
          </Badge>
        ) : null}
      </Link>

      <div className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Keuangan
      </div>
      <Link href="/customer-panel/billing" className={linkClass("/customer-panel/billing")}>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span>Tagihan & Pembayaran</span>
        </div>
        {typeof unpaidCount === "number" && unpaidCount > 0 ? (
          <Badge variant="destructive" className="h-5 px-1.5 min-w-[1.25rem] flex items-center justify-center font-normal">
            {unpaidCount}
          </Badge>
        ) : null}
      </Link>

      <div className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Lainnya
      </div>
      <Link href="/customer-panel/settings" className={linkClass("/customer-panel/settings")}>
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Pengaturan Profil</span>
        </div>
      </Link>
    </nav>
  )
}

