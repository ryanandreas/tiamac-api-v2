"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Home,
  Users,
  ClipboardList,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  Wrench,
  Package,
  FileText,
  Bell,
  Settings,
  LayoutDashboard,
  Truck,
  History,
  Briefcase,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"

// Menu items based on planning.md
const adminMenu = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "SERVIS",
    items: [
      { title: "Booking", url: "/dashboard/booking", icon: Bell },
      { title: "Jadwal Perbaikan", url: "/dashboard/jadwal", icon: Calendar },
      { title: "Servis Berjalan", url: "/dashboard/servis", icon: Truck },
      { title: "History", url: "/dashboard/history", icon: History },
    ]
  },
  {
    title: "Operasional",
    items: [
      { title: "Layanan & Harga", url: "/dashboard/layanan", icon: CreditCard },
      { title: "Inventory & Sparepart", url: "/dashboard/inventory", icon: Package },
    ]
  },
  {
    title: "User Management",
    items: [
      { title: "Teknisi", url: "/dashboard/users", icon: Wrench },
      { title: "Pelanggan", url: "/dashboard/customers", icon: Users },
    ]
  },
  {
    title: "Finance & Reports",
    items: [
      { title: "Pembayaran & Transaksi", url: "/dashboard/transaksi", icon: CreditCard },
      { title: "Laporan", url: "/dashboard/laporan", icon: FileText },
    ]
  },
  {
    title: "System",
    items: [
      { title: "Notifikasi", url: "/dashboard/notifikasi", icon: Bell },
      { title: "Pengaturan Sistem", url: "/dashboard/pengaturan", icon: Settings },
    ]
  }
]

// Assuming 'karyawan' is the role name in the database, which is equivalent to 'teknisi'
const karyawanMenu = [
  {
    title: "Technician Panel",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Jadwal Saya", url: "/dashboard/jadwal-saya", icon: Calendar },
      { title: "Tugas Saya", url: "/dashboard/tugas", icon: Briefcase },
      { title: "Dalam Pengecekan", url: "/dashboard/pengecekan", icon: Wrench },
      { title: "Sedang Dikerjakan", url: "/dashboard/pengerjaan", icon: Truck },
      { title: "Inventory", url: "/dashboard/inventory", icon: Package },
      { title: "Riwayat Servis", url: "/dashboard/riwayat", icon: History },
    ]
  }
]

export function AppSidebar({ userRole, userName, userEmail, ...props }: React.ComponentProps<typeof Sidebar> & { userRole?: string, userName?: string, userEmail?: string }) {
  // Normalize role to lowercase for comparison and treat 'teknisi' as 'karyawan' if needed, or just check for 'karyawan'
  const role = userRole?.toLowerCase()
  const isTechnician = role === "karyawan" || role === "teknisi"
  const menuGroups = role === "admin" ? adminMenu : isTechnician ? karyawanMenu : []
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex h-12 items-center px-4 border-b">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image
              src="/images/logo.svg"
              alt="Logo"
              width={120}
              height={24}
              className="h-6 w-auto"
              priority
            />
          </Link>
        </div>
        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari menu..." className="h-9 pl-8" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <div className="px-2 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </div>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} size="lg">
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
