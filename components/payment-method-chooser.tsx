"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { CreditCard, Landmark, QrCode, Wallet, Copy, CheckCircle2, Clock, Loader2, Link as LinkIcon } from "lucide-react"
import { chargePayment, checkPaymentStatus } from "@/app/actions/payment"
import { useRouter } from "next/navigation"

type MethodId = "qris" | "gopay" | "dana" | "ovo" | "shopee" | "va_bca" | "va_mandiri" | "va_bni" | "va_bri"

const METHODS: Array<{
  id: MethodId
  label: string
  description: string
  image: string
  category: "qris" | "bank_transfer" | "gopay"
  bank?: string
}> = [
  { id: "qris", label: "QRIS", description: "Scan QR Bank / E-Wallet", image: "/images/payments/qris.svg", category: "qris" },
  { id: "va_bca", label: "BCA", description: "BCA Virtual Account", image: "/images/payments/bca.svg", category: "bank_transfer", bank: "bca" },
  { id: "gopay", label: "GoPay", description: "Pembayaran GoPay", image: "/images/payments/gopay.svg", category: "gopay" },
  { id: "dana", label: "DANA", description: "Bayar via Aplikasi DANA", image: "/images/payments/dana.svg", category: "qris" },
  { id: "ovo", label: "OVO", description: "Bayar via Aplikasi OVO", image: "/images/payments/ovo.svg", category: "qris" },
  { id: "va_bri", label: "BRI", description: "BRIVA / BRI Transfer", image: "/images/payments/bri.svg", category: "bank_transfer", bank: "bri" },
  { id: "va_bni", label: "BNI", description: "BNI Virtual Account", image: "/images/payments/bni.svg", category: "bank_transfer", bank: "bni" },
  { id: "shopee", label: "SHOPEE", description: "ShopeePay / SPayLater", image: "/images/payments/shopee.svg", category: "qris" },
  { id: "va_mandiri", label: "MANDIRI", description: "Mandiri Bill Payment", image: "/images/payments/mandiri.svg", category: "bank_transfer", bank: "mandiri" },
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
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [checkingStatus, setCheckingStatus] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [countdown, setCountdown] = React.useState(3)

  const [paymentResult, setPaymentResult] = React.useState<{
    va_number?: string;
    qr_url?: string;
    bank?: string;
    expiry_time?: string;
  } | null>(null)
  const [isCopied, setIsCopied] = React.useState(false)
  
  const router = useRouter()
  const selectedMethod = METHODS.find((m) => m.id === selected) ?? METHODS[0]

  // Auto-check status on mount to handle redirects from Midtrans
  React.useEffect(() => {
    const autoCheck = async () => {
      try {
        const res = await checkPaymentStatus(orderId)
        if (res.success && res.status === "SETTLEMENT") {
          setOpen(true)
          setIsSuccess(true)
        }
      } catch (err) {
        console.error("Auto-check failed:", err)
      }
    }
    autoCheck()
  }, [orderId])

  // Redirect after success
  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000)
    } else if (isSuccess && countdown === 0) {
      router.push("/customer-panel/pesanan?tab=ongoing")
    }
    return () => clearTimeout(timer)
  }, [isSuccess, countdown, router])

  const handleProcessPayment = async () => {
    setLoading(true)
    try {
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

  const handleCheckStatus = async () => {
    setCheckingStatus(true)
    try {
      const res = await checkPaymentStatus(orderId)
      if (res.success && res.status === "SETTLEMENT") {
        setIsSuccess(true)
      } else {
        alert("Pembayaran belum terverifikasi. Tunggu beberapa saat lalu coba lagi.")
      }
    } catch (err) {
      console.error(err)
      alert("Gagal cek status.")
    } finally {
      setCheckingStatus(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="text-[11px] font-bold text-slate-400 tracking-widest uppercase px-1">
        Pilih Metode Pembayaran
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(isExpanded ? METHODS : METHODS.slice(0, 4)).map((m) => {
          const active = m.id === selected
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-top-2",
                active 
                  ? "border-[#66B21D] bg-green-50/30 ring-1 ring-[#66B21D]/20 shadow-md shadow-green-100/50" 
                  : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-16 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 transition-colors",
                    active ? "border-[#66B21D]/30" : ""
                  )}>
                    <img src={m.image} alt={m.label} className="max-w-full max-h-full object-contain" />
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

      <Button
        variant="ghost"
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full h-10 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-[11px] gap-2 hover:bg-slate-50 transition-all"
      >
        {isExpanded ? (
          <>
            Sembunyikan Metode <Clock className="rotate-180 size-3 transition-transform" />
          </>
        ) : (
          <>
            Lihat {METHODS.length - 4} Metode Lainnya <Clock className="size-3" />
          </>
        )}
      </Button>

      {triggerId && (
        <button
          id={triggerId}
          className="hidden"
          onClick={() => setOpen(true)}
        />
      )}

      <Dialog open={open} onOpenChange={(val) => {
        setOpen(val)
        if (!val) {
          setPaymentResult(null)
          setIsSuccess(false)
          setCountdown(3)
          setIsCopied(false)
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-[32px] border-none p-0 overflow-hidden">
          {isSuccess ? (
            <div className="p-10 text-center space-y-6 animate-in zoom-in-95 duration-500">
               <div className="mx-auto size-24 rounded-full bg-green-50 flex items-center justify-center text-[#66B21D] animate-bounce">
                  <CheckCircle2 className="size-12" />
               </div>
               <div className="space-y-2">
                 <DialogHeader className="items-center">
                   <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight transition-all">
                     Pembayaran Berhasil!
                   </DialogTitle>
                   <DialogDescription className="text-sm font-semibold text-slate-500 leading-relaxed px-4">
                     Terima kasih atas pembayarannya. Unit AC Anda segera kami jadwalkan untuk pengerjaan.
                   </DialogDescription>
                 </DialogHeader>
               </div>
               <div className="pt-4">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <Loader2 className="size-3 animate-spin" />
                   Mengarahkan dalam {countdown} detik...
                 </div>
               </div>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 px-6 py-6 text-center border-b border-slate-100 relative">
                 <div className="absolute top-0 right-0 p-6 opacity-5">
                   <CreditCard className="size-24" />
                 </div>
                 <DialogHeader className="items-center">
                    <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">{title}</DialogTitle>
                    <DialogDescription className="text-xs font-bold text-slate-500 mt-1">
                      Total Bayar: <span className="text-[#66B21D]">{formatRupiah(amount)}</span>
                    </DialogDescription>
                 </DialogHeader>
              </div>

              <div className="p-6 space-y-5">
                {!paymentResult ? (
                  <div className="space-y-5 py-2">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border-none flex items-center gap-3.5">
                       <div className="size-9 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400">
                          <Clock className="size-4.5" />
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Metode Terpilih</p>
                          <p className="text-sm font-bold text-slate-900">{selectedMethod.label}</p>
                       </div>
                    </div>
                    
                    <div className="p-3.5 rounded-2xl bg-orange-50 border-none text-orange-600 space-y-1">
                       <p className="text-[11px] font-bold flex items-center gap-2">
                         <Clock className="size-3" /> Konfirmasi Pembayaran
                       </p>
                       <p className="text-[10px] font-semibold opacity-80 leading-tight">
                         Lanjutkan untuk mendapatkan nomor Virtual Account atau QR Code pembayaran Anda.
                       </p>
                    </div>

                    <Button 
                      onClick={handleProcessPayment} 
                      disabled={loading}
                      className="w-full h-12 rounded-2xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-sm shadow-xl shadow-green-200/50 transition-all active:scale-95"
                    >
                      {loading ? <Loader2 className="animate-spin size-5 mr-2" /> : <LinkIcon className="size-5 mr-2" />}
                      Bayar Sekarang
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {paymentResult.va_number ? (
                      <div className="text-center space-y-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Virtual Account {paymentResult.bank?.toUpperCase()}</p>
                          <div className="relative group">
                            <div className="text-2xl sm:text-3xl font-black text-[#66B21D] tracking-normal py-4 bg-slate-50 rounded-2xl group-hover:bg-green-50 transition-colors break-all">
                              {paymentResult.va_number}
                            </div>
                            <Button 
                               variant="ghost" 
                               onClick={() => copyToClipboard(paymentResult.va_number!)}
                               className={cn(
                                 "absolute top-1/2 -translate-y-1/2 right-3 h-8 w-8 rounded-lg transition-all",
                                 isCopied ? "bg-green-500 text-white" : "bg-white shadow-sm text-slate-400 hover:text-[#66B21D]"
                               )}
                            >
                               {isCopied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
                            </Button>
                          </div>
                          {isCopied && (
                            <p className="text-[10px] font-bold text-[#66B21D] mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                              Nomor Virtual Account berhasil disalin ke clipboard!
                            </p>
                          )}
                        </div>
                      </div>
                    ) : paymentResult.qr_url ? (
                      <div className="text-center space-y-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan QRIS Berikut</p>
                          <div className="mx-auto p-3 bg-white border-4 border-slate-50 rounded-[32px] shadow-2xl shadow-slate-200/50 w-fit">
                            <img 
                              src={paymentResult.qr_url} 
                              alt="QRIS" 
                              className="size-40 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      <Button 
                        onClick={handleCheckStatus}
                        disabled={checkingStatus}
                        className="w-full h-12 rounded-2xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-sm transition-all"
                      >
                        {checkingStatus ? <Loader2 className="size-5 mr-2 animate-spin" /> : <CheckCircle2 className="size-5 mr-2" />}
                        Cek Status Pembayaran
                      </Button>

                      <Button 
                        onClick={() => setOpen(false)}
                        variant="ghost"
                        className="w-full h-10 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-[11px] uppercase tracking-widest"
                      >
                        Selesai & Tutup
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
