"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { CreditCard, Landmark, QrCode, Wallet, Copy, CheckCircle2, Clock, Loader2, Link as LinkIcon } from "lucide-react"
import { chargePayment } from "@/app/actions/payment"
import { useRouter } from "next/navigation"

type MethodId = "qris" | "gopay" | "va_bca" | "va_mandiri" | "va_bni" | "va_bri"

const METHODS: Array<{
  id: MethodId
  label: string
  description: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  category: "qris" | "bank_transfer" | "gopay"
  bank?: string
}> = [
  { id: "qris", label: "QRIS / All Payment", description: "Scan QR via aplikasi bank/e-wallet.", Icon: QrCode, category: "qris" },
  { id: "gopay", label: "GoPay / ShopeePay", description: "Otomatis buka aplikasi E-Wallet.", Icon: Wallet, category: "gopay" },
  { id: "va_bca", label: "BCA Virtual Account", description: "Transfer via m-BCA atau KlikBCA.", Icon: Landmark, category: "bank_transfer", bank: "bca" },
  { id: "va_mandiri", label: "Mandiri Bill", description: "Pembayaran via Mandiri Online.", Icon: Landmark, category: "bank_transfer", bank: "mandiri" },
  { id: "va_bni", label: "BNI Virtual Account", description: "Transfer via BNI Mobile Banking.", Icon: Landmark, category: "bank_transfer", bank: "bni" },
  { id: "va_bri", label: "BRIVA (BRI)", description: "Transfer via BRImo atau ATM BRI.", Icon: Landmark, category: "bank_transfer", bank: "bri" },
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
  triggerId,
}: {
  orderId: string
  amount: number
  title: string
  buttonText?: string
  buttonClassName?: string
  triggerId?: string
}) {
  const [selected, setSelected] = React.useState<MethodId>("qris")
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [paymentResult, setPaymentResult] = React.useState<{
    va_number?: string;
    qr_url?: string;
    bank?: string;
    expiry_time?: string;
  } | null>(null)
  
  const router = useRouter()
  const selectedMethod = METHODS.find((m) => m.id === selected) ?? METHODS[0]

  const handleProcessPayment = async () => {
    setLoading(true)
    try {
      // paymentType is slightly hardcoded here for testing context, 
      // in real use it should be passed from parent (OrderDetailPage)
      const res = await chargePayment(
        orderId, 
        amount < 100000 ? "DOWN_PAYMENT" : "FULL_PAYMENT", 
        selectedMethod.category,
        selectedMethod.bank
      )

      if (res.success) {
        setPaymentResult({
          va_number: res.va_number,
          qr_url: res.qr_url,
          bank: res.bank,
          expiry_time: res.expiry_time
        })
      } else {
        alert(res.message)
      }
    } catch (err) {
      console.error(err)
      alert("Gagal memproses pembayaran.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Berhasil disalin!")
  }

  return (
    <div className="space-y-4">
      <div className="text-[11px] font-bold text-slate-400 tracking-widest uppercase px-1">
        Pilih Metode Pembayaran
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
                "rounded-2xl border p-4 text-left transition-all duration-300 relative overflow-hidden group",
                active 
                  ? "border-[#66B21D] bg-green-50/30 ring-1 ring-[#66B21D]/20 shadow-md shadow-green-100/50" 
                  : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "size-10 rounded-xl flex items-center justify-center transition-colors",
                    active ? "bg-[#66B21D] text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    <m.Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className={cn("text-sm font-bold tracking-tight", active ? "text-slate-900" : "text-slate-600")}>
                      {m.label}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 tracking-wide line-clamp-1">{m.description}</div>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    active ? "border-[#66B21D] bg-white scale-110" : "border-slate-200"
                  )}
                >
                  {active && <div className="h-2 w-2 rounded-full bg-[#66B21D]" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {triggerId && (
        <button
          id={triggerId}
          className="hidden"
          onClick={() => setOpen(true)}
        />
      )}

      <Dialog open={open} onOpenChange={(val) => {
        setOpen(val)
        if (!val) setPaymentResult(null)
      }}>
        <DialogContent className="sm:max-w-md rounded-[32px] border-none p-0 overflow-hidden">
          <div className="bg-slate-50 px-6 py-8 text-center border-b border-slate-100 relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <CreditCard className="size-32" />
             </div>
             <DialogHeader className="items-center">
                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">{title}</DialogTitle>
                <DialogDescription className="text-sm font-bold text-slate-500 mt-2">
                  Total yang harus dibayar: <span className="text-[#66B21D]">{formatRupiah(amount)}</span>
                </DialogDescription>
             </DialogHeader>
          </div>

          <div className="p-8 space-y-6">
            {!paymentResult ? (
              <div className="space-y-6 py-4">
                <div className="p-4 rounded-2xl bg-slate-50 border-none flex items-center gap-4">
                   <div className="size-10 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400">
                      <Clock className="size-5" />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metode Terpilih</p>
                      <p className="text-sm font-bold text-slate-900">{selectedMethod.label}</p>
                   </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-orange-50 border-none text-orange-600 space-y-1">
                   <p className="text-xs font-bold flex items-center gap-2">
                     <Clock className="size-3.5" /> Konfirmasi Pembayaran
                   </p>
                   <p className="text-[10px] font-semibold opacity-80 leading-relaxed">
                     Lanjutkan untuk mendapatkan nomor Virtual Account atau QR Code pembayaran Anda.
                   </p>
                </div>

                <Button 
                  onClick={handleProcessPayment} 
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-sm shadow-xl shadow-green-200/50 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin size-5 mr-2" /> : <LinkIcon className="size-5 mr-2" />}
                  Bayar Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {paymentResult.va_number ? (
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Virtual Account {paymentResult.bank?.toUpperCase()}</p>
                      <div className="relative group">
                        <div className="text-4xl font-black text-[#66B21D] tracking-tighter py-4 bg-slate-50 rounded-3xl group-hover:bg-green-50 transition-colors">
                          {paymentResult.va_number}
                        </div>
                        <Button 
                           variant="ghost" 
                           onClick={() => copyToClipboard(paymentResult.va_number!)}
                           className="absolute top-1/2 -translate-y-1/2 right-4 h-10 w-10 rounded-xl bg-white shadow-sm text-slate-400 hover:text-[#66B21D]"
                        >
                           <Copy className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : paymentResult.qr_url ? (
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Scan QRIS Berikut</p>
                      <div className="mx-auto p-4 bg-white border-8 border-slate-50 rounded-[40px] shadow-2xl shadow-slate-200/50 w-fit">
                        <img 
                          src={paymentResult.qr_url} 
                          alt="QRIS" 
                          className="size-48 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 text-[#66B21D]">
                    <CheckCircle2 className="size-5 shrink-0" />
                    <p className="text-[10px] font-bold leading-tight uppercase tracking-wide">
                      Instruksi telah dikirim. Hubungi CS jika pembayaran belum terverifikasi dalam 10 menit.
                    </p>
                  </div>

                  <Button 
                    onClick={() => setOpen(false)}
                    className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm transition-all"
                  >
                    Selesai & Tutup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
