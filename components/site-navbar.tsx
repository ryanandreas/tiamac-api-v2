"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { UserDropdown } from "@/components/user-dropdown"
import type { CurrentUser } from "@/app/actions/session"

const menuItems = [
  { name: "Layanan", href: "/#layanan" },
  { name: "Promo", href: "/#promo" },
  { name: "Harga", href: "/harga" },
  { name: "Testimoni", href: "/#testimoni" },
]

export function SiteNavbar({
  user,
  mode = "fixed",
}: {
  user?: CurrentUser
  mode?: "fixed" | "sticky"
}) {
  const [menuState, setMenuState] = React.useState(false)
  const pathname = usePathname()
  const isCustomerPanel = pathname.startsWith("/customer-panel")
  const isAuthenticated = !!user?.isAuthenticated

  const navClassName =
    mode === "sticky"
      ? "sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md"
      : "fixed z-50 w-full bg-white/80 backdrop-blur-md"

  return (
    <header>
      <nav data-state={menuState && "active"} className={navClassName}>
        <div className="m-auto max-w-7xl px-6 md:px-12">
          <div className="flex flex-wrap items-center justify-between gap-6 py-4 lg:gap-0 lg:py-5">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center gap-3">
                <Image 
                  src="/images/logo.png" 
                  alt="Tiam AC Logo" 
                  width={40} 
                  height={40} 
                  className="h-10 w-auto object-contain"
                  priority
                />
                <span className="text-xl font-black text-slate-900 tracking-tight">AC Tiam</span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl p-6 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-10 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              {!isCustomerPanel && (
                <div className="lg:pr-4">
                  <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-[14px]">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="text-slate-600 font-bold hover:text-[#66B21D] transition-colors"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={`flex w-full flex-col space-y-3 sm:flex-row sm:gap-4 sm:space-y-0 md:w-fit ${!isCustomerPanel ? 'lg:border-l lg:pl-10' : ''}`}>
                {isAuthenticated ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {!isCustomerPanel && (
                      <Link
                        href={user?.type === "customer" ? "/customer-panel/dashboard" : "/dashboard"}
                        className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all bg-[#66B21D] text-white hover:bg-[#4d9e0f] h-10 px-6 shadow-sm"
                      >
                        Buka Dashboard
                      </Link>
                    )}
                    <UserDropdown user={user} />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all bg-[#66B21D] text-white hover:bg-[#4d9e0f] h-10 px-6"
                  >
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
