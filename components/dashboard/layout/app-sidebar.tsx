'use client'

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/context/dashboard/sidebar-context"
import {
  Home,
  User,
  Settings,
  List,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  LogOut
} from "lucide-react"
import { Logo } from "@/components/logo"
import { getCurrentUser } from "@/app/actions/session"
import { cn } from "@/lib/utils"

export const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const pathname = usePathname()
  const [user, setUser] = useState<{ isAuthenticated: boolean; type: string | null; id: string | null; role?: string } | null>(null)

  useEffect(() => {
    async function checkUser() {
      const userData = await getCurrentUser()
      setUser(userData)
    }
    checkUser()
  }, [])

  const isActive = (path: string) => pathname === path

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0",
        isExpanded ? "w-72" : "w-20",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link href="/" className="flex items-center gap-2">
           <Logo className="text-white" />
           {isExpanded && <span className="text-xl font-bold text-white">TiamAC</span>}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-500">
              GENERAL
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <Link
                  href="/dashboard"
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                    isActive("/dashboard") && "bg-gray-800 text-white"
                  )}
                >
                  <Home className="h-5 w-5" />
                  {isExpanded && "Dashboard"}
                </Link>
              </li>
            </ul>
          </div>

          {user?.role === "admin" && (
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-500">
                ADMIN
              </h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <Link
                    href="/users"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/users") && "bg-gray-800 text-white"
                    )}
                  >
                    <User className="h-5 w-5" />
                    {isExpanded && "List Staff"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/customers"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/customers") && "bg-gray-800 text-white"
                    )}
                  >
                    <User className="h-5 w-5" />
                    {isExpanded && "List Customer"}
                  </Link>
                </li>
              </ul>

              <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-500">
                LIST SERVIS
              </h3>
              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                   <Link
                    href="/allservis"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/allservis") && "bg-gray-800 text-white"
                    )}
                  >
                    <List className="h-5 w-5" />
                    {isExpanded && "Sedang Berjalan"}
                  </Link>
                </li>
                <li>
                   <Link
                    href="/listservispenjadwalan"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/listservispenjadwalan") && "bg-gray-800 text-white"
                    )}
                  >
                    <Calendar className="h-5 w-5" />
                    {isExpanded && "Menunggu Jadwal"}
                  </Link>
                </li>
                <li>
                   <Link
                    href="/allkonfirmasiteknisi"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/allkonfirmasiteknisi") && "bg-gray-800 text-white"
                    )}
                  >
                    <CheckCircle className="h-5 w-5" />
                    {isExpanded && "Konfirmasi Teknisi"}
                  </Link>
                </li>
                 <li>
                   <Link
                    href="/allmenunggupembayaran"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/allmenunggupembayaran") && "bg-gray-800 text-white"
                    )}
                  >
                    <CreditCard className="h-5 w-5" />
                    {isExpanded && "Menunggu Pembayaran"}
                  </Link>
                </li>
                 <li>
                   <Link
                    href="/allprosesservis"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/allprosesservis") && "bg-gray-800 text-white"
                    )}
                  >
                    <Clock className="h-5 w-5" />
                    {isExpanded && "Proses Servis"}
                  </Link>
                </li>
                 <li>
                   <Link
                    href="/allservisselesai"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/allservisselesai") && "bg-gray-800 text-white"
                    )}
                  >
                    <CheckCircle className="h-5 w-5" />
                    {isExpanded && "Selesai"}
                  </Link>
                </li>
              </ul>
            </div>
          )}

           {user?.role === "teknisi" && (
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-500">
                LIST SERVIS
              </h3>
              <ul className="mb-6 flex flex-col gap-1.5">
                 <li>
                   <Link
                    href="/allservis"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/allservis") && "bg-gray-800 text-white"
                    )}
                  >
                    <List className="h-5 w-5" />
                    {isExpanded && "Semua Pesanan"}
                  </Link>
                </li>
                 <li>
                   <Link
                    href="/konfirmasiteknisi"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/konfirmasiteknisi") && "bg-gray-800 text-white"
                    )}
                  >
                    <CheckCircle className="h-5 w-5" />
                    {isExpanded && "Konfirmasi Pesanan"}
                  </Link>
                </li>
                 <li>
                   <Link
                    href="/onprosesservis"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/onprosesservis") && "bg-gray-800 text-white"
                    )}
                  >
                    <Clock className="h-5 w-5" />
                    {isExpanded && "Sedang Dikerjakan"}
                  </Link>
                </li>
                 <li>
                   <Link
                    href="/servisselesai"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/servisselesai") && "bg-gray-800 text-white"
                    )}
                  >
                    <CheckCircle className="h-5 w-5" />
                    {isExpanded && "Selesai Dikerjakan"}
                  </Link>
                </li>
              </ul>
            </div>
           )}

            {user?.role === "karyawan" && (
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-500">
                LIST SERVIS
              </h3>
              <ul className="mb-6 flex flex-col gap-1.5">
                 <li>
                   <Link
                    href="/allservis"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/allservis") && "bg-gray-800 text-white"
                    )}
                  >
                    <List className="h-5 w-5" />
                    {isExpanded && "Semua Pesanan"}
                  </Link>
                </li>
                 <li>
                   <Link
                    href="/konfirmasiteknisi"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/konfirmasiteknisi") && "bg-gray-800 text-white"
                    )}
                  >
                    <CheckCircle className="h-5 w-5" />
                    {isExpanded && "Konfirmasi Pesanan"}
                  </Link>
                </li>
                 <li>
                   <Link
                    href="/onprosesservis"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/onprosesservis") && "bg-gray-800 text-white"
                    )}
                  >
                    <Clock className="h-5 w-5" />
                    {isExpanded && "Sedang Dikerjakan"}
                  </Link>
                </li>
                 <li>
                   <Link
                    href="/servisselesai"
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-300 duration-300 ease-in-out hover:bg-gray-800 hover:text-white",
                      isActive("/servisselesai") && "bg-gray-800 text-white"
                    )}
                  >
                    <CheckCircle className="h-5 w-5" />
                    {isExpanded && "Selesai Dikerjakan"}
                  </Link>
                </li>
              </ul>
            </div>
           )}
        </nav>
      </div>
    </aside>
  )
}
