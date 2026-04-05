"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type AlertType = "success" | "error" | "info"

interface FloatingAlertProps {
  message: string | null
  type?: AlertType
  onClose: () => void
  duration?: number
}

export function FloatingAlert({ message, type = "success", onClose, duration = 5000 }: FloatingAlertProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 500) // Wait for animation to finish
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [message, duration, onClose])

  if (!message && !isVisible) return null

  const config = {
    success: {
      icon: <CheckCircle2 className="size-7" />,
      bg: "bg-white",
      border: "border-green-100",
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      label: "Berhasil",
      labelColor: "text-green-400",
      shadow: "shadow-green-200/40",
      ring: "ring-green-50/50"
    },
    error: {
      icon: <AlertCircle className="size-7" />,
      bg: "bg-white",
      border: "border-rose-100",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      label: "Terjadi Kesalahan",
      labelColor: "text-rose-400",
      shadow: "shadow-rose-200/40",
      ring: "ring-rose-50/50"
    },
    info: {
      icon: <Info className="size-7" />,
      bg: "bg-white",
      border: "border-blue-100",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      label: "Informasi",
      labelColor: "text-blue-400",
      shadow: "shadow-blue-200/40",
      ring: "ring-blue-50/50"
    }
  }

  const { icon, bg, border, iconBg, iconColor, label, labelColor, shadow, ring } = config[type]

  return (
    <div className={cn(
      "fixed top-12 left-1/2 -translate-x-1/2 z-[200] w-full max-w-xl px-4 transition-all duration-500 ease-out",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
    )}>
      <div className={cn(
        "p-6 rounded-[28px] border flex items-center gap-5 shadow-2xl ring-4",
        bg, border, shadow, ring
      )}>
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", iconBg, iconColor)}>
          {icon}
        </div>
        <div className="text-left flex-1">
          <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1.5", labelColor)}>{label}</p>
          <p className="text-sm font-bold text-slate-900 leading-tight uppercase tracking-tight">{message}</p>
        </div>
        <button 
          type="button"
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 500)
          }}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-300 hover:text-slate-500"
        >
          <X className="size-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  )
}
