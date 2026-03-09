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

// Assuming 'karyawan' is the role name in the database, which is equivalent to 'teknisi'
const karyawanMenu = [
  {
    title: "List Servis",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Semua Pesanan", url: "/dashboard/allservis", icon: ClipboardList },
      { title: "Konfirmasi Teknisi", url: "/dashboard/allkonfirmasiteknisi", icon: CheckCircle },
      { title: "Proses Servis", url: "/dashboard/allprosesservis", icon: Wrench },
      { title: "Selesai", url: "/dashboard/allservisselesai", icon: CheckCircle },
    ]
  }
]

export function AppSidebar({ userRole, userName, userEmail, ...props }: React.ComponentProps<typeof Sidebar> & { userRole?: string, userName?: string, userEmail?: string }) {
  // Normalize role to lowercase for comparison and treat 'teknisi' as 'karyawan' if needed, or just check for 'karyawan'
  const role = userRole?.toLowerCase();
  const menuGroups = role === "admin" ? adminMenu : (role === "karyawan" || role === "teknisi") ? karyawanMenu : []
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
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <div className="px-2 py-2 text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </div>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} size="lg">
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="text-base font-medium">{item.title}</span>
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
                    <span className="truncate text-xs">{userEmail || "Staff"}</span>
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
                      <span className="truncate text-xs">{userEmail || "user@example.com"}</span>
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
