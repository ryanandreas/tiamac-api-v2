"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"

const routeMap: Record<string, string> = {
  dashboard: "Dashboard",
  booking: "Booking Masuk",
  jadwal: "Jadwal Perbaikan",
  servis: "Servis Berjalan",
  history: "History Selesai",
  layanan: "Katalog Layanan",
  inventory: "Inventory Stok",
  users: "Data Teknisi",
  customers: "Daftar Pelanggan",
  transaksi: "Transaksi Masuk",
  laporan: "Laporan Bulanan",
  notifikasi: "Notifikasi",
  pengaturan: "Settings Sistem",
  pesanan: "Pesanan Saya",
  billing: "Billing",
  "customer-panel": "Customer Panel",
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter((segment) => segment !== "")

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList className="gap-1 md:gap-2">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-[#66B21D]">
              <Home className="size-3.5" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`
          const label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator className="text-slate-300" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-black text-[11px] uppercase tracking-widest text-[#66B21D]">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      href={href} 
                      className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
