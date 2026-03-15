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
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Users,
  Calendar,
  CreditCard,
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
  ChevronRight,
  LogOut,
} from "lucide-react"
import { logout } from "@/app/actions/session"

// Menu items based on planning.md
const adminMenu = [
  {
    title: "Utama",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Manajemen Servis",
    items: [
      { title: "Booking Masuk", url: "/dashboard/booking", icon: Bell },
      { title: "Jadwal Perbaikan", url: "/dashboard/jadwal", icon: Calendar },
      { title: "Servis Berjalan", url: "/dashboard/servis", icon: Truck },
      { title: "History Selesai", url: "/dashboard/history", icon: History },
    ]
  },
  {
    title: "Operasional Gudang",
    items: [
      { title: "Katalog Layanan", url: "/dashboard/layanan", icon: CreditCard },
      { title: "Inventory Stok", url: "/dashboard/inventory", icon: Package },
    ]
  },
  {
    title: "User & Pelanggan",
    items: [
      { title: "Data Teknisi", url: "/dashboard/users", icon: Wrench },
      { title: "Daftar Pelanggan", url: "/dashboard/customers", icon: Users },
    ]
  },
  {
    title: "Laporan Keuangan",
    items: [
      { title: "Transaksi Masuk", url: "/dashboard/transaksi", icon: CreditCard },
      { title: "Laporan Bulanan", url: "/dashboard/laporan", icon: FileText },
    ]
  },
  {
    title: "Konfigurasi",
    items: [
      { title: "Pusat Notifikasi", url: "/dashboard/notifikasi", icon: Bell },
      { title: "Settings Sistem", url: "/dashboard/pengaturan", icon: Settings },
    ]
  }
]

const karyawanMenu = [
  {
    title: "Utama",
    items: [
      { title: "Beranda Kerja", url: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Tugas Lapangan",
    items: [
      { title: "Penugasan Baru", url: "/dashboard/tugas", icon: Bell },
      { title: "Jadwal Servis", url: "/dashboard/jadwal-saya", icon: Calendar },
      { title: "Pengecekan & Diagnosa", url: "/dashboard/pengecekan", icon: Search },
      { title: "Proses Pengerjaan", url: "/dashboard/pengerjaan", icon: Wrench },
    ]
  },
  {
    title: "Logistik & Arsip",
    items: [
      { title: "Cek Stok Material", url: "/dashboard/inventory", icon: Package },
      { title: "Riwayat Kerja", url: "/dashboard/riwayat", icon: History },
    ]
  }
]

export function AppSidebar({ 
  userRole, 
  userName, 
  userEmail, 
  badgeCounts,
  ...props 
}: React.ComponentProps<typeof Sidebar> & { 
  userRole?: string, 
  userName?: string, 
  userEmail?: string,
  badgeCounts?: {
    booking: number;
    jadwal: number;
    servis: number;
  }
}) {
  const role = userRole?.toLowerCase()
  const isTechnician = role === "karyawan" || role === "teknisi"
  const menuGroups = role === "admin" ? adminMenu : isTechnician ? karyawanMenu : []
  const pathname = usePathname()

  return (
    <Sidebar {...props} className="border-r border-slate-100 bg-white">
      <SidebarHeader className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group px-2 mb-4">
          <div className="size-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:border-[#66B21D]/20 group-hover:shadow-md">
             <Image
                src="/images/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="size-7 object-contain transition-all"
                priority
              />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 tracking-tight">TIAM AC</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dashboard</span>
          </div>
        </Link>
                
      </SidebarHeader>

      <SidebarContent className="px-4 pb-8">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title} className="mb-6">
            <div className="px-3 pb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-80">
              {group.title}
            </div>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => {
                const isActive = pathname === item.url
                
                // Badge Logic for Admin
                let badge = null
                if (role === "admin") {
                  if (item.url === "/dashboard/booking" && badgeCounts?.booking) {
                    badge = badgeCounts.booking
                  } else if (item.url === "/dashboard/jadwal" && badgeCounts?.jadwal) {
                    badge = badgeCounts.jadwal
                  } else if (item.url === "/dashboard/servis" && badgeCounts?.servis) {
                    badge = badgeCounts.servis
                  }
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      className={`h-11 rounded-xl px-4 transition-all duration-200 group relative ${
                        isActive 
                        ? "bg-green-50 text-[#66B21D] shadow-sm shadow-green-500/5 hover:bg-green-50 hover:text-[#66B21D]" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className={`h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-[#66B21D]" : "text-slate-400 group-hover:text-slate-900"}`} />
                        <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? "text-slate-900" : ""}`}>{item.title}</span>
                        
                        {badge && (
                          <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white px-1 leading-none animate-in zoom-in duration-300">
                            {badge}
                          </span>
                        )}
                        
                        {isActive && !badge && <ChevronRight className="h-3.5 w-3.5 ml-auto text-[#66B21D] animate-in slide-in-from-left-2 duration-300" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-6 mt-auto border-t border-slate-50">
        <button 
          onClick={() => logout()}
          className="w-full h-12 rounded-2xl bg-slate-900 flex items-center justify-center gap-3 text-white hover:bg-red-600 transition-all duration-300 group shadow-lg shadow-slate-900/10 active:scale-95"
        >
          <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest">Keluar Dashboard</span>
        </button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
