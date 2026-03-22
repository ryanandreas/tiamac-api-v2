'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { logout } from "@/app/actions/session"
import type { CurrentUser } from "@/app/actions/session"
import { User, Settings, LogOut, History, ShoppingBag, ChevronDown } from "lucide-react"

function getInitials(value?: string) {
  const text = value?.trim()
  if (!text) return "US"
  const parts = text.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? ""
  return (first + second).toUpperCase()
}

export function UserDropdown({ user }: { user?: CurrentUser }) {
  const displayName =
    user?.isAuthenticated ? (user.name ?? "User") : "User"
  const displayEmail =
    user?.isAuthenticated ? (user.email ?? "") : ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-12 gap-3 rounded-2xl px-2 hover:bg-slate-50 transition-all group">
          <div className="relative">
            <Avatar className="h-9 w-9 rounded-xl shadow-sm group-hover:scale-105 transition-all">
              <AvatarImage src="/images/avatar.png" alt={displayName} />
              <AvatarFallback className="bg-slate-100 text-slate-400 font-black text-xs">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="hidden md:flex flex-col items-start leading-tight">
            <span className="max-w-[140px] truncate text-sm font-black text-slate-900">
              {displayName}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {user?.isAuthenticated && user.type === "staff" ? user.role : "Customer"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 border-none shadow-2xl rounded-2xl overflow-hidden mt-2" align="end">
        <DropdownMenuLabel className="p-4 font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black text-slate-900 leading-none">{displayName}</p>
            <p className="text-xs text-slate-400 font-bold truncate leading-tight mt-1">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-50" />
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem asChild className="rounded-xl p-2.5 cursor-pointer focus:bg-green-50 focus:text-[#66B21D] transition-colors group">
            <Link 
              href={user?.type === "customer" ? "/customer-panel/dashboard" : "/dashboard"}
              className="flex items-center gap-3"
            >
              <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center group-focus:bg-white group-focus:shadow-sm transition-all text-slate-400 group-focus:text-[#66B21D]">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-sm font-black">Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl p-2.5 cursor-pointer focus:bg-green-50 focus:text-[#66B21D] transition-colors group">
            <Link 
              href={user?.type === "customer" ? "/customer-panel/pesanan?tab=history" : "/dashboard/history"}
              className="flex items-center gap-3"
            >
              <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center group-focus:bg-white group-focus:shadow-sm transition-all text-slate-400 group-focus:text-[#66B21D]">
                <History className="h-4 w-4" />
              </div>
              <span className="text-sm font-black">Riwayat</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl p-2.5 cursor-pointer focus:bg-green-50 focus:text-[#66B21D] transition-colors group">
            <Link 
              href={user?.type === "customer" ? "/customer-panel/settings" : "/dashboard/profile"}
              className="flex items-center gap-3"
            >
              <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center group-focus:bg-white group-focus:shadow-sm transition-all text-slate-400 group-focus:text-[#66B21D]">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-black">Profil Akun</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-50" />
        <div className="p-1">
          <DropdownMenuItem 
            className="rounded-xl p-2.5 cursor-pointer text-red-600 focus:text-white focus:bg-red-500 hover:text-white hover:bg-red-500 data-[highlighted]:bg-red-500 data-[highlighted]:text-white transition-all gap-3 group"
            onClick={() => logout()}
          >
            <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center group-focus:bg-white/20 group-hover:bg-white/20 transition-all text-red-500 group-focus:text-white group-hover:text-white group-data-[highlighted]:bg-white/20 group-data-[highlighted]:text-white">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="text-sm font-black group-focus:text-white group-hover:text-white group-data-[highlighted]:text-white">Keluar Sesi</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
