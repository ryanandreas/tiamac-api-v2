'use client'

import React from "react"
import { useSidebar } from "@/context/dashboard/sidebar-context"
import { UserDropdown } from "@/components/user-dropdown"
import { Menu, Search } from "lucide-react"

export const AppHeader = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-30 flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Hamburger Toggle BTN */}
          <button
            aria-controls="sidebar"
            onClick={toggleMobileSidebar}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          {/* Hamburger Toggle BTN */}
        </div>

        <div className="hidden sm:block">
          <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-500" />
              </button>

              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* Dark Mode Toggler */}
            {/* Notification Menu Area */}
            {/* Chat Notification Area */}
          </ul>

          {/* User Area */}
          <UserDropdown />
          {/* User Area */}
        </div>
      </div>
    </header>
  )
}
