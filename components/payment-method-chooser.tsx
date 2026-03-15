"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { CreditCard, Landmark, QrCode, Wallet } from "lucide-react"

type MethodId = "qris" | "ewallet" | "va" | "bank_transfer"

const METHODS: Array<{
  id: MethodId
  label: string
  description: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}> = [
  { id: "qris", label: "QRIS", description: "Scan QR via aplikasi bank/e-wallet.", Icon: QrCode },
  { id: "ewallet", label: "E-Wallet", description: "GoPay / OVO / DANA (otomatis).", Icon: Wallet },
  { id: "va", label: "Virtual Account", description: "BCA / BNI / Mandiri / BRIVA.", Icon: Landmark },
  { id: "bank_transfer", label: "Transfer Bank", description: "Manual transfer via ATM / m-banking.", Icon: CreditCard },
]

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function PaymentMethodChooser({
  orderId,
  amount,
  title,
  buttonText,
  buttonClassName,
  triggerId,
}: {
  orderId: string
  amount: number
  title: string
  buttonText: string
  buttonClassName?: string
  triggerId?: string
}) {
  const [selected, setSelected] = React.useState<MethodId>("qris")
  const selectedMethod = METHODS.find((m) => m.id === selected) ?? METHODS[0]

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Metode Pembayaran
      </div>
      <div className="grid grid-cols-1 gap-2">
        {METHODS.map((m) => {
          const active = m.id === selected
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                active ? "border-primary bg-primary/5" : "border-muted hover:bg-muted/40"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <m.Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                    <div className={cn("text-sm font-semibold", active ? "text-foreground" : "text-foreground")}>
                      {m.label}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{m.description}</div>
                </div>
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                    active ? "border-primary" : "border-muted"
                  )}
                >
                  {active ? <div className="h-2 w-2 rounded-full bg-primary" /> : null}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className={buttonClassName}>
            {buttonText}
          </Button>
        </DialogTrigger>
        {triggerId && (
          <button
            id={triggerId}
            className="hidden"
            onClick={() => {
              // This is a hacky way to trigger Dialog from outside
              // since Shadcn DialogTrigger needs to be a child.
              // Better way would be controlled state, but this fits the existing structure.
              const trigger = document.querySelector(`[aria-haspopup="dialog"]`) as HTMLButtonElement;
              if (trigger) trigger.click();
            }}
          />
        )}
        <DialogContent className="sm:max-w-xl">
          <DialogHeader className="text-center">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>UI pemilihan metode pembayaran (gateway belum diaktifkan).</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-dashed bg-background p-4">
              <div className="flex items-start justify-between gap-3 text-sm">
                <div className="text-muted-foreground">Order ID</div>
                <div className="text-right font-medium">{orderId}</div>
              </div>
              <div className="mt-2 flex items-start justify-between gap-3 text-sm">
                <div className="text-muted-foreground">Metode</div>
                <div className="text-right font-semibold">{selectedMethod.label}</div>
              </div>
              <div className="mt-2 flex items-start justify-between gap-3 text-sm">
                <div className="text-muted-foreground">Nominal</div>
                <div className="text-right font-semibold">{formatRupiah(amount)}</div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground leading-relaxed">
              Setelah payment gateway diaktifkan, tombol ini akan mengarahkan Anda ke halaman pembayaran sesuai metode
              yang dipilih (VA/QRIS/E-Wallet).
            </div>

            <div className="flex justify-end">
              <Button type="button" variant="outline">
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
