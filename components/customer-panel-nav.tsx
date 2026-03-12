import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export type CustomerPanelActive = "pesanan" | "history" | "profile"

export function CustomerPanelNav({
  active,
  ongoingCount,
  historyCount,
  highlightOngoing,
}: {
  active: CustomerPanelActive
  ongoingCount?: number
  historyCount?: number
  highlightOngoing?: boolean
}) {
  const linkClass = (key: CustomerPanelActive) =>
    `flex items-center justify-between gap-3 rounded px-3 py-2 text-sm ${
      active === key ? "bg-muted font-medium" : "hover:bg-muted/60"
    }`

  return (
    <nav className="space-y-1 rounded-lg border bg-card p-2">
      <Link href="/listpesanan" className={linkClass("pesanan")}>
        <span>Pesanan</span>
        {typeof ongoingCount === "number" ? (
          <Badge variant={highlightOngoing ? "destructive" : "secondary"} className="font-normal">
            {ongoingCount}
          </Badge>
        ) : null}
      </Link>
      <Link href="/historyPesanan" className={linkClass("history")}>
        <span>History</span>
        {typeof historyCount === "number" ? (
          <Badge variant="secondary" className="font-normal">
            {historyCount}
          </Badge>
        ) : null}
      </Link>
      <Link href="/profilcust" className={linkClass("profile")}>
        <span>Profile</span>
      </Link>
    </nav>
  )
}

