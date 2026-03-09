'use client'

import React, { useEffect, useState } from "react"
import { getCurrentUser } from "@/app/actions/session"
import { Users, User, Settings, ShoppingBag } from "lucide-react"

export default function Dashboard() {
  const [user, setUser] = useState<{ isAuthenticated: boolean; type: string | null; id: string | null; role?: string } | null>(null)

  useEffect(() => {
    async function checkUser() {
      const userData = await getCurrentUser()
      setUser(userData)
    }
    checkUser()
  }, [])

  if (!user) return null

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Dashboard
        </h2>

        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <a className="font-medium" href="/dashboard">
                Dashboard /
              </a>
            </li>
            <li className="font-medium text-primary">Overview</li>
          </ol>
        </nav>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6">
            <h3 className="text-xl font-bold text-black dark:text-white">
                Welcome back, {user.type === 'staff' ? user.role : 'Customer'}
            </h3>
            <p className="text-sm text-gray-500">
                Here is what's happening with your projects today.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
           {/* Card 1 */}
          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
               <Users className="text-primary" />
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  0
                </h4>
                <span className="text-sm font-medium">Total Staff</span>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <User className="text-primary" />
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  0
                </h4>
                <span className="text-sm font-medium">Total Customers</span>
              </div>
            </div>
          </div>
           {/* Card 3 */}
           <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <ShoppingBag className="text-primary" />
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  0
                </h4>
                <span className="text-sm font-medium">Total Orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
