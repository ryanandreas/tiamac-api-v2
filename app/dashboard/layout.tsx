'use client'

import { SidebarProvider } from "@/context/dashboard/sidebar-context"
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar"
import { AppHeader } from "@/components/dashboard/layout/app-header"
import { Backdrop } from "@/components/dashboard/layout/sidebar-extras"
import React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden dark:bg-boxdark-2 dark:text-bodydark">
        {/* Sidebar */}
        <AppSidebar />
        {/* Sidebar */}

        {/* Content Area */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <AppHeader />
          {/* Header */}

          {/* Main Content */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
          {/* Main Content */}
        </div>
        {/* Content Area */}
        <Backdrop />
      </div>
    </SidebarProvider>
  )
}
