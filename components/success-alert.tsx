"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SuccessAlertProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export function SuccessAlert({ message, isVisible, onClose }: SuccessAlertProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 500) // Wait for fade out animation
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible && !show) return null

  return (
    <div 
      className={cn(
        "fixed top-0 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out transform",
        show ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div className="flex items-center gap-4 bg-[#f0fdf4] border-x border-b border-[#dcfce7] px-8 py-3.5 rounded-b-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-center w-7 h-7 bg-[#166534] rounded-lg text-white">
          <Check className="size-4.5 stroke-[3]" />
        </div>
        <span className="text-[13px] font-black text-[#166534] tracking-tight">
          {message}
        </span>
      </div>
    </div>
  )
}
