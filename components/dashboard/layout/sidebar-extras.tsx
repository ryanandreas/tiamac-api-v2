'use client'

import { useSidebar } from "@/context/dashboard/sidebar-context"
import { cn } from "@/lib/utils"
import Link from "next/link"
import React from "react"
import { usePathname } from "next/navigation"

export const SidebarWidget = () => {
  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]">
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        #1 Admin Dashboard
      </h3>
      <p className="mb-4 text-gray-500 dark:text-gray-400">
        Multipurpose admin dashboard template for Next.js
      </p>
      <Link
        href="https://tailadmin.com/pricing"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center rounded-lg bg-primary p-3 font-medium text-white hover:bg-opacity-90"
      >
        Purchase Pro
      </Link>
    </div>
  )
}

export const Backdrop = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar()
  
  if (!isMobileOpen) return null

  return (
    <div
      onClick={toggleMobileSidebar}
      className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
    />
  )
}
