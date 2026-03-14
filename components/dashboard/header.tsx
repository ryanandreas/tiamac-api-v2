"use client"

import { useSyncExternalStore } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
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
import { Bell, LogOut, User } from "lucide-react"
import Link from "next/link"
import { logout } from "@/app/actions/session"

export function DashboardHeader({ title = "Dashboard" }: { title?: string }) {
  const subscribe = () => () => {}
  const cookieSnapshot = useSyncExternalStore(
    subscribe,
    () => (typeof document === "undefined" ? "" : document.cookie),
    () => ""
  )

  const cookies = Object.fromEntries(
    cookieSnapshot
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((pair) => {
        const idx = pair.indexOf("=")
        if (idx === -1) return [pair, ""]
        const key = pair.slice(0, idx)
        const value = decodeURIComponent(pair.slice(idx + 1))
        return [key, value]
      })
  )

  const profile = {
    name: cookies.name || "",
    email: cookies.email || "",
    role: cookies.role || "",
  }

  const roleLower = profile.role?.toLowerCase()
  const isTechnician = roleLower === "karyawan" || roleLower === "teknisi"

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon-sm">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifikasi</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Avatar className="h-7 w-7 rounded-lg">
                <AvatarImage src="/images/avatar.png" alt={profile.name} />
                <AvatarFallback className="rounded-lg">
                  {profile.name?.slice(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Profil</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56 rounded-lg" side="bottom" align="end" sideOffset={6}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="/images/avatar.png" alt={profile.name} />
                  <AvatarFallback className="rounded-lg">
                    {profile.name?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{profile.name || "User"}</span>
                    <Badge
                      variant={roleLower === "admin" ? "default" : "secondary"}
                      className="h-4 px-1 text-[9px]"
                    >
                      {profile.role
                        ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1).toLowerCase()
                        : "Staff"}
                    </Badge>
                  </div>
                  <span className="truncate text-sm">{profile.email || "user@example.com"}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isTechnician && (
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
      </div>
    </header>
  )
}
