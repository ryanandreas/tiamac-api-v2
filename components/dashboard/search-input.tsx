"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

interface SearchInputProps {
  placeholder?: string
  defaultValue?: string
}

export function SearchInput({ placeholder = "Cari...", defaultValue = "" }: SearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()

  // Keep state in sync with URL (e.g. when back button is pressed)
  useEffect(() => {
    const q = searchParams.get("q") || ""
    setValue(q)
  }, [searchParams])

  useEffect(() => {
    // Prevent infinite loop by checking if the value has actually changed 
    // compared to what's already in the URL
    const currentQ = searchParams.get("q") || ""
    if (value === currentQ) return

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set("q", value)
      } else {
        params.delete("q")
      }
      
      // Reset to page 1 when searching
      params.set("page", "1")

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 400) // 400ms debounce

    return () => clearTimeout(timeout)
  }, [value, pathname, router, searchParams])

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 h-10 text-xs font-semibold bg-slate-50 border-none rounded-xl focus-visible:ring-[#66B21D] shadow-none"
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
           <div className="size-3 border-2 border-[#66B21D]/30 border-t-[#66B21D] rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
