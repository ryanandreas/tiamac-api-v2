"use client"

import { useEffect, useState } from "react"
import { FloatingAlert, AlertType } from "@/components/ui/floating-alert"

export function LayananAlertHandler() {
  const [alert, setAlert] = useState<{ message: string; type: AlertType } | null>(null)

  useEffect(() => {
    const handleAlert = (e: any) => {
      if (e.detail) {
        setAlert(e.detail)
      }
    }

    window.addEventListener("show-layanan-alert", handleAlert)
    return () => window.removeEventListener("show-layanan-alert", handleAlert)
  }, [])

  if (!alert) return null

  return (
    <FloatingAlert 
      message={alert.message} 
      type={alert.type} 
      onClose={() => setAlert(null)} 
    />
  )
}

/**
 * Utility to trigger the floating alert from any client component
 */
export function triggerLayananAlert(message: string, type: AlertType = "success") {
  const event = new CustomEvent("show-layanan-alert", {
    detail: { message, type }
  })
  window.dispatchEvent(event)
}
