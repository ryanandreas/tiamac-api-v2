"use client"

import * as React from "react"
import Link from "next/link"
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
} from "lucide-react"
import { logout } from "@/app/actions/session"

// Menu items based on reference-nodejs/src/components/Sidebar.jsx
const adminMenu = [
  {
    title: "General",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
    ]
  },
  {
    title: "Admin",
    items: [
      { title: "List Staff", url: "/dashboard/users", icon: Users },
      { title: "List Customer", url: "/dashboard/customers", icon: Users },
    ]
  },
  {
    title: "List Servis",
    items: [
      { title: "Sedang Berjalan", url: "/dashboard/allservis", icon: Wrench },
      { title: "Menunggu Jadwal", url: "/dashboard/listservispenjadwalan", icon: Calendar },
      { title: "Konfirmasi Teknisi", url: "/dashboard/allkonfirmasiteknisi", icon: CheckCircle },
      { title: "Menunggu Pembayaran", url: "/dashboard/allmenunggupembayaran", icon: CreditCard },
      { title: "Proses Servis", url: "/dashboard/allprosesservis", icon: Clock },
      { title: "Selesai", url: "/dashboard/allservisselesai", icon: CheckCircle },
    ]
  }
]

const teknisiMenu = [
  {
    title: "List Servis",
    items: [
      { title: "Semua Pesanan", url: "/dashboard/allservis", icon: ClipboardList },
      { title: "Konfirmasi Teknisi", url: "/dashboard/allkonfirmasiteknisi", icon: CheckCircle },
      { title: "Proses Servis", url: "/dashboard/allprosesservis", icon: Wrench },
      { title: "Selesai", url: "/dashboard/allservisselesai", icon: CheckCircle },
    ]
  }
]

export function AppSidebar({ userRole, ...props }: React.ComponentProps<typeof Sidebar> & { userRole?: string }) {
  const menuGroups = userRole === "admin" ? adminMenu : userRole === "teknisi" ? teknisiMenu : []
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex h-12 items-center px-4 font-semibold text-lg border-b">
          Staff Portal
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group.title}
            </div>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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
            <SidebarMenuButton onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
