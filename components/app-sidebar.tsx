"use client"

import * as React from "react"
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
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Home,
  Users,
  ClipboardList,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  LogOut,
  Wrench,
  ChevronsUpDown,
  User,
  Package,
  FileText,
  Bell,
  Settings,
  LayoutDashboard,
  Truck,
  History,
  Briefcase,
} from "lucide-react"
import { logout } from "@/app/actions/session"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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
  const role = userRole?.toLowerCase();
  const menuGroups = role === "admin" ? adminMenu : (role === "karyawan" || role === "teknisi") ? karyawanMenu : []
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {mounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="/images/avatar.png" alt={userName} />
                      <AvatarFallback className="rounded-lg">
                        {userName?.slice(0, 2).toUpperCase() || "US"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userName || userRole || "User"}</span>
                      <span className="truncate text-sm">{userEmail || "Staff"}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="top"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="/images/avatar.png" alt={userName} />
                        <AvatarFallback className="rounded-lg">
                          {userName?.slice(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold">{userName || "User"}</span>
                          <Badge variant={userRole === "admin" ? "default" : "secondary"} className="h-4 px-1 text-[9px]">
                            {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase() : "Staff"}
                          </Badge>
                        </div>
                        <span className="truncate text-sm">{userEmail || "user@example.com"}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(role === "karyawan" || role === "teknisi") && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="/images/avatar.png" alt={userName} />
                  <AvatarFallback className="rounded-lg">
                    {userName?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userName || userRole || "User"}</span>
                  <span className="truncate text-sm">{userEmail || "Staff"}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
