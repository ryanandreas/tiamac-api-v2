"use client"

import { Bell, Check, Clock, AlertCircle } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const notifications = [
  {
    id: 1,
    title: "Pesanan Dikonfirmasi",
    description: "Teknisi Budi telah dikonfirmasi untuk pesanan #AC-12345.",
    time: "5 menit yang lalu",
    type: "success",
    unread: true,
  },
  {
    id: 2,
    title: "Menunggu Pembayaran",
    description: "Segera selesaikan pembayaran DP untuk pesanan #AC-88271.",
    time: "2 jam yang lalu",
    type: "warning",
    unread: true,
  },
  {
    id: 3,
    title: "Servis Selesai",
    description: "Pekerjaan untuk unit AC Ruang Tamu telah dinyatakan selesai.",
    time: "1 hari yang lalu",
    type: "info",
    unread: false,
  },
]

export function NotificationDropdown() {
  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-green-50 hover:text-[#66B21D] transition-all">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 border-2 border-white rounded-full text-[10px] font-black animate-bounce">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="end">
        <div className="bg-[#66B21D] p-5 text-white">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm tracking-widest uppercase">Notifikasi</h4>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[9px] font-black px-2">
              {unreadCount} BARU
            </Badge>
          </div>
        </div>
        <DropdownMenuGroup className="max-h-[350px] overflow-y-auto">
          {notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="p-4 cursor-pointer focus:bg-slate-50 border-b border-slate-50 last:border-0">
              <div className="flex gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'success' ? 'bg-green-50 text-green-600' :
                  n.type === 'warning' ? 'bg-orange-50 text-orange-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {n.type === 'success' ? <Check className="h-5 w-5" /> :
                   n.type === 'warning' ? <AlertCircle className="h-5 w-5" /> :
                   <Clock className="h-5 w-5" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-black ${n.unread ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</p>
                    <span className="text-[10px] text-slate-300 font-bold whitespace-nowrap">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed line-clamp-2">
                    {n.description}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <div className="p-3 bg-slate-50 border-t border-slate-100">
          <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-[#66B21D] hover:bg-green-100 hover:text-[#4d9e0f]">
            Lihat Semua Pesan <ArrowRight className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
