"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string>
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null

  const createUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    return `${baseUrl}?${params.toString()}`
  }

  const pages = []
  const maxVisiblePages = 5

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push("ellipsis-start")
    
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    
    for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
    }
    
    if (currentPage < totalPages - 2) pages.push("ellipsis-end")
    if (!pages.includes(totalPages)) pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Link href={createUrl(Math.max(1, currentPage - 1))}>
        <Button variant="outline" size="icon" disabled={currentPage === 1} className="rounded-xl border-slate-100 hover:bg-[#66B21D] hover:text-white transition-all size-9">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Link>

      <div className="flex items-center gap-1">
        {pages.map((p, i) => {
          if (p === "ellipsis-start" || p === "ellipsis-end") {
            return (
              <div key={`ellipsis-${i}`} className="size-9 flex items-center justify-center text-slate-300">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )
          }

          const pageNum = p as number
          const isActive = pageNum === currentPage

          return (
            <Link key={pageNum} href={createUrl(pageNum)}>
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`size-9 rounded-xl font-black text-xs transition-all ${
                  isActive 
                    ? "bg-[#66B21D] hover:bg-[#4d9e0f] border-none shadow-lg shadow-green-500/20" 
                    : "border-slate-100 hover:border-green-100 hover:bg-green-50 text-slate-400 font-bold"
                }`}
              >
                {pageNum}
              </Button>
            </Link>
          )
        })}
      </div>

      <Link href={createUrl(Math.min(totalPages, currentPage + 1))}>
        <Button variant="outline" size="icon" disabled={currentPage === totalPages} className="rounded-xl border-slate-100 hover:bg-[#66B21D] hover:text-white transition-all size-9">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
