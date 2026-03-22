"use client"

import { UserDropdown } from "@/components/user-dropdown"
import { NotificationDropdown } from "@/components/notification-dropdown"
import type { CurrentUser } from "@/app/actions/session"
import { Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardHeader({ user }: { user?: CurrentUser }) {
  return (
    <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="size-10 rounded-xl hover:bg-slate-100 transition-all border-none shadow-none md:flex" />
        <div className="h-6 w-px bg-slate-100 mx-2 hidden md:block"></div>
        <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors pointer-events-none" />
          <Input 
            placeholder="Cari transaksi atau pesanan..." 
            className="pl-10 h-11 border-none bg-slate-100/50 rounded-2xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all text-xs font-bold"
          />
        </div>
      </div>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationDropdown />
        <div className="h-8 w-px bg-slate-100 mx-2"></div>
        <UserDropdown user={user} />
      </div>
    </div>
  )
}
