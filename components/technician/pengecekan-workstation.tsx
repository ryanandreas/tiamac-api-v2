"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  User, 
  Wrench, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  Activity,
  CreditCard,
  History,
  Wind,
  ChevronDown,
  Search,
  Settings,
  Package,
  Box
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import {
  addMaterialUsage,
  addUnitLayanan,
  addAcUnit,
  removeAcUnit,
  removeMaterialUsage,
  removeUnitLayanan,
  submitPengecekan,
  startPengecekan,
} from "@/app/actions/teknisi"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type InventoryItem = {
  id: string
  nama: string
  uom: string
  harga: number
  qtyOnHand: number
}

type UsageItem = {
  id: string
  itemId: string
  qty: number
  harga_satuan: number
  notes: string | null
  item: { nama: string; uom: string }
}

type UnitLayanan = { id: string; nama: string; harga: number; catalogId: string | null }
type ServiceUnit = { id: string; pk: string; layanan: UnitLayanan[] }
type CatalogRow = { uuid: string; nama: string; pk: string | null; harga: number }
type StatusHistory = { id: string; status: string; notes: string | null; createdAt: Date }

export function PengecekanWorkstation({
  serviceId,
  statusServis,
  customerName,
  customerAlamat,
  teknisiName,
  statusHistory,
  jadwal,
  biayaDasar,
  acUnits,
  catalogRows,
  inventoryItems,
  usages,
}: {
  serviceId: string
  statusServis: string
  customerName: string
  customerAlamat: string
  teknisiName: string
  statusHistory: StatusHistory[]
  jadwal?: string | null
  biayaDasar: number
  acUnits: ServiceUnit[]
  catalogRows: CatalogRow[]
  inventoryItems: InventoryItem[]
  usages: UsageItem[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [qty, setQty] = useState<string>("1")
  const [selectedUnitId, setSelectedUnitId] = useState<string>("")
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>("")
  const [newUnitPk, setNewUnitPk] = useState<string>("1")
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)

  const materialTotal = useMemo(
    () => usages.reduce((sum, u) => sum + u.qty * u.harga_satuan, 0),
    [usages]
  )

  const layananTotal = useMemo(() => {
    return acUnits.reduce((sum, unit) => {
      return sum + unit.layanan.reduce((inner, l) => inner + l.harga, 0)
    }, 0)
  }, [acUnits])

  const grandTotal = useMemo(() => {
    return biayaDasar + layananTotal + materialTotal
  }, [biayaDasar, layananTotal, materialTotal])

  const isStepKonfirmasi = statusServis === "Konfirmasi Teknisi"
  const isStepPengecekan = statusServis === "Konfirmasi Teknisi" || statusServis === "Pengecekan Unit" || statusServis === "Dalam Pengecekan" || statusServis === "Menunggu Persetujuan Customer"
  const canEdit = isStepPengecekan && !busy

  const unitOptions = useMemo(() => {
    return acUnits.map((u, idx) => ({ id: u.id, label: `Unit ${idx + 1} (${u.pk} PK)` }))
  }, [acUnits])

  const selectedUnit = useMemo(() => acUnits.find((u) => u.id === selectedUnitId), [acUnits, selectedUnitId])

  const layananOptions = useMemo(() => {
    if (!selectedUnit) return []
    const pkKey = String(selectedUnit.pk)
    const usedCatalog = new Set(selectedUnit.layanan.map((l) => l.catalogId).filter(Boolean) as string[])
    return catalogRows
      .filter((r) => r.pk === null || r.pk === pkKey)
      .filter((r) => !usedCatalog.has(r.uuid))
      .map((r) => ({
        uuid: r.uuid,
        label: `${r.nama} (Rp ${r.harga.toLocaleString("id-ID")})`,
      }))
  }, [catalogRows, selectedUnit])

  async function handleConfirm() {
    setBusy(true)
    setError(null)
    try {
      const res = await startPengecekan(serviceId)
      if (!res?.success) {
        setError(res?.message ?? "Gagal konfirmasi.")
        return
      }
      setIsConfirmOpen(false)
      router.push("/dashboard/ongoing?msg=confirmed")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleAddAcUnit() {
    setBusy(true)
    setError(null)
    try {
      const res = await addAcUnit({ serviceId, pk: newUnitPk })
      if (!res?.success) setError(res?.message ?? "Gagal menambah unit.")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleAddLayanan() {
    if (!selectedCatalogId || !selectedUnitId) return
    setBusy(true)
    setError(null)
    try {
      const res = await addUnitLayanan({ unitId: selectedUnitId, catalogId: selectedCatalogId })
      if (!res?.success) setError(res?.message ?? "Gagal menambah layanan.")
      setSelectedCatalogId("")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleAddUsage() {
    if (!selectedItemId) return
    setBusy(true)
    setError(null)
    try {
      const res = await addMaterialUsage({
        serviceId,
        itemId: selectedItemId,
        qty: Number(qty),
      })
      if (!res?.success) setError(res?.message ?? "Gagal menambah barang.")
      setSelectedItemId("")
      setQty("1")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit() {
    setBusy(true)
    setError(null)
    try {
      const res = await submitPengecekan({ serviceId, jasaTambahan: 0 })
      if (!res?.success) {
        setError(res?.message ?? "Gagal submit pengecekan.")
        return
      }
      setIsSubmitDialogOpen(false)
      router.push("/dashboard/ongoing")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 animate-fade-in font-outfit pb-12">
      {/* 1. Slim Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <Badge className="bg-[#66B21D]/10 text-[#66B21D] border-none shadow-none font-black text-[9px] uppercase tracking-widest h-6 px-3 rounded-full">
               Workstation Diagnostic
             </Badge>
             <span className="text-slate-300 font-bold text-xs">•</span>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order ID #{serviceId.slice(0, 8).toUpperCase()}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Diagnostic Terminal</h1>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-white border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest h-8 px-4 rounded-xl shadow-sm">
             {statusServis}
           </Badge>
        </div>
      </div>

      {/* 2. Main Page Card */}
      <div className="bg-white rounded-3xl border border-slate-50 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-4 md:p-6 space-y-6">
          {/* Info Bar Segment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[
               { icon: User, label: "Pelanggan", value: customerName, color: "text-blue-500", bg: "bg-blue-50/50" },
               { icon: Wrench, label: "Teknisi", value: teknisiName, color: "text-[#66B21D]", bg: "bg-green-50/50" },
               { icon: MapPin, label: "Lokasi", value: customerAlamat, color: "text-amber-500", bg: "bg-amber-50/50" }
             ].map((item, i) => (
               <div key={i} className={cn("rounded-2xl p-3 border border-slate-50/50 flex items-center gap-3 group transition-all", item.bg)}>
                  <div className={cn("size-9 rounded-xl bg-white flex items-center justify-center shadow-sm", item.color)}>
                     <item.icon className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0">{item.label}</span>
                     <span className="text-sm font-black text-slate-900 truncate">{item.value}</span>
                  </div>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 3. Main Action Area (Left) */}
            <div className="lg:col-span-8 space-y-6">
               {/* A. Table Card */}
               <div className="bg-slate-50/30 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Activity className="size-4 text-[#66B21D]" />
                        <h2 className="text-base font-black text-slate-900 tracking-tight">Rincian Estimasi Biaya</h2>
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock className="size-3 text-slate-300" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{jadwal || "Sesuai Pesanan"}</span>
                     </div>
                  </div>

                  <div className="p-0 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white/50 border-b border-slate-50">
                          <th className="text-left py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Pekerjaan & Suku Cadang</th>
                          <th className="text-center py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Qty</th>
                          <th className="text-right py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Harga</th>
                          <th className="text-right py-4 px-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        <tr className="hover:bg-white/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900">Biaya Kunjungan & Pemeriksaan</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight opacity-60">Pemeriksaan Unit Standar</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-slate-500 text-xs">1x</td>
                          <td className="py-4 px-4 text-right text-[10px] font-bold text-slate-400">Rp {biayaDasar.toLocaleString("id-ID")}</td>
                          <td className="py-4 px-6 text-right text-xs font-black text-slate-900">Rp {biayaDasar.toLocaleString("id-ID")}</td>
                        </tr>

                        {acUnits.map((unit, uIdx) => {
                          if (unit.layanan.length === 0) {
                            return (
                              <tr key={unit.id} className="group hover:bg-red-50/20 transition-colors border-b border-slate-50 last:border-0 italic">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                     <div className="size-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center text-[9px] font-black shrink-0 border border-slate-200/50">AC {uIdx + 1}</div>
                                     <div className="flex flex-col min-w-0">
                                      <span className="text-xs font-bold text-slate-400">Belum ada layanan dipilih</span>
                                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight opacity-60">{unit.pk} PK Unit</span>
                                     </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  {canEdit && (
                                    <button onClick={() => removeAcUnit({ unitId: unit.id })} className="size-6 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm mx-auto" title="Hapus Unit">
                                      <Trash2 className="size-3" />
                                    </button>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-right text-[10px] font-bold text-slate-300">-</td>
                                <td className="py-4 px-6 text-right text-xs font-black text-slate-300">-</td>
                              </tr>
                            );
                          }
                          return unit.layanan.map((l, lIdx) => (
                            <tr key={l.id} className="group hover:bg-white/40 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                   <div className="size-8 rounded-lg bg-green-50 text-[#66B21D] flex items-center justify-center text-[9px] font-black shrink-0 border border-green-100/50">AC {uIdx + 1}</div>
                                   <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-black text-slate-900 truncate">{l.nama}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight opacity-60">{unit.pk} PK Unit</span>
                                   </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="flex items-center justify-center gap-2 text-nowrap">
                                   <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[8px] font-black h-5 px-2 rounded-lg border-none">1x</Badge>
                                   {canEdit && (
                                     <div className="flex items-center gap-1">
                                       <button onClick={() => removeUnitLayanan({ unitLayananId: l.id })} className="size-6 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Hapus Layanan">
                                         <Trash2 className="size-3" />
                                       </button>
                                       {lIdx === 0 && (
                                         <button onClick={() => removeAcUnit({ unitId: unit.id })} className="size-6 rounded-lg bg-slate-100/50 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Hapus Seluruh Unit">
                                           <Trash2 className="size-3" />
                                         </button>
                                       )}
                                     </div>
                                   )}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right text-[10px] font-bold text-slate-400">Rp {l.harga.toLocaleString("id-ID")}</td>
                              <td className="py-4 px-6 text-right text-xs font-black text-slate-900">Rp {l.harga.toLocaleString("id-ID")}</td>
                            </tr>
                          ));
                        })}

                        {usages.map((u) => (
                          <tr key={u.id} className="group hover:bg-white/40 transition-colors">
                            <td className="py-3 px-6">
                              <div className="flex items-center gap-3">
                                 <div className="size-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100/50"><Wrench className="size-3" /></div>
                                 <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-black text-slate-900 truncate">{u.item.nama}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight opacity-60">Suku Cadang</span>
                                 </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                 <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[8px] font-black h-5 px-2 rounded-lg border-none">{u.qty}x</Badge>
                                 {canEdit && (
                                   <button onClick={() => removeMaterialUsage({ usageId: u.id })} className="size-6 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                     <Trash2 className="size-3" />
                                   </button>
                                 )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right text-[10px] font-bold text-slate-400">Rp {u.harga_satuan.toLocaleString("id-ID")}</td>
                            <td className="py-3 px-6 text-right text-xs font-black text-slate-900">Rp {(u.qty * u.harga_satuan).toLocaleString("id-ID")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>

               {/* B. Independent Price Summary */}
               <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative border-4 border-slate-800/50 group transition-all hover:border-slate-700/50">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-6 transition-transform">
                     <CreditCard className="size-16" />
                  </div>
                  <div className="p-5 text-white relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="space-y-1">
                        <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Estimasi Tagihan</h2>
                        <div className="flex items-baseline gap-2">
                           <span className="text-3xl font-black tracking-tight leading-tight">Rp {grandTotal.toLocaleString("id-ID")}</span>
                        </div>
                     </div>
                     <div className="flex gap-8 border-l border-white/10 pl-6">
                        <div className="space-y-0.5">
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Jasa / Layanan</p>
                           <p className="text-sm font-bold text-white">Rp {(biayaDasar + layananTotal).toLocaleString("id-ID")}</p>
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Suku Cadang</p>
                           <p className="text-sm font-bold text-blue-400">Rp {materialTotal.toLocaleString("id-ID")}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* C. Pro Support Card */}
               <div className="bg-[#66B21D]/5 border border-dashed border-[#66B21D]/30 p-5 rounded-2xl flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-[#66B21D]/10 text-[#66B21D] flex items-center justify-center shrink-0">
                     <AlertCircle className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                     <h4 className="text-[13px] font-black text-slate-900">Diagnosis Workstation Standard</h4>
                     <p className="text-[11px] font-bold text-slate-500 leading-relaxed max-w-[500px]">Pastikan jumlah unit dan jenis layanan telah disesuaikan sebelum menekan tombol konfirmasi estimasi.</p>
                  </div>
               </div>
            </div>

            {/* 4. Sidebar Action Card (Right) */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
               <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-fit">
                  {canEdit && (
                     <div className="p-6 space-y-8 bg-[#F8FAFC]/50 flex-1">
                        <div className="space-y-3">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 capitalize tracking-wider">Tambah Unit</span>
                           </div>
                           <div className="flex gap-2">
                              <div className="relative flex-1">
                                 <Wind className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-amber-500 z-10" />
                                 <select className="h-10 w-full appearance-none rounded-xl border border-slate-200/80 bg-white/60 backdrop-blur-sm pl-9 pr-8 text-[11px] font-black text-slate-800 outline-none transition-all shadow-sm focus:bg-white focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500" value={newUnitPk} onChange={(e) => setNewUnitPk(e.target.value)}>
                                    <option value="" disabled>Pilih PK...</option>
                                    <option value="0.5">0.5 PK</option>
                                    <option value="0.75">0.75 PK</option>
                                    <option value="1">1.0 PK</option>
                                    <option value="1.5">1.5 PK</option>
                                    <option value="2">2.0 PK</option>
                                    <option value="2.5">2.5 PK</option>
                                 </select>
                                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
                              </div>
                              <Button onClick={handleAddAcUnit} disabled={busy} className="h-10 w-10 p-0 rounded-xl bg-slate-900 group relative overflow-hidden transition-all active:scale-95 shadow-lg shadow-slate-900/20">
                                 <Plus className="size-4 text-white z-10" />
                              </Button>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 capitalize tracking-wider">Tambah Layanan Servis</span>
                           </div>
                           <div className="grid grid-cols-1 gap-1.5">
                              <div className="relative w-full focus-within:ring-4 focus-within:ring-[#66B21D]/20 focus-within:shadow-lg transition-all duration-300">
                                 <Settings className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#66B21D] z-10" />
                                 <select className="h-10 w-full appearance-none rounded-xl border border-slate-200/80 bg-white/60 backdrop-blur-sm pl-9 pr-8 text-[11px] font-black text-slate-800 outline-none transition-all shadow-sm focus:bg-white focus:border-[#66B21D]" value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)}>
                                    <option value="">Pilih Unit AC</option>
                                    {unitOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                                 </select>
                                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
                              </div>
                              <div className="flex gap-2">
                                 <div className="relative flex-1 focus-within:ring-4 focus-within:ring-[#66B21D]/20 focus-within:shadow-lg transition-all duration-300">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#66B21D] z-10" />
                                    <select className="h-10 w-full appearance-none rounded-xl border border-slate-200/80 bg-white/60 backdrop-blur-sm pl-9 pr-8 text-[11px] font-black text-slate-800 outline-none transition-all shadow-sm focus:bg-white focus:border-[#66B21D] disabled:opacity-50" value={selectedCatalogId} onChange={(e) => setSelectedCatalogId(e.target.value)} disabled={!selectedUnitId}>
                                       <option value="">Pilih Layanan Servis</option>
                                       {layananOptions.map(o => <option key={o.uuid} value={o.uuid}>{o.label}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
                                 </div>
                                 <Button onClick={handleAddLayanan} disabled={busy || !selectedCatalogId} className="h-10 w-10 p-0 rounded-xl bg-[#66B21D] hover:bg-[#5aa11a] text-white shadow-lg shadow-green-500/20 transition-all active:scale-95">
                                    <Plus className="size-4" />
                                 </Button>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 capitalize tracking-wider">Kelola Suku Cadang</span>
                           </div>
                           <div className="grid grid-cols-1 gap-1.5">
                              <div className="relative w-full">
                                 <Package className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-blue-500 z-10" />
                                 <select className="h-10 w-full appearance-none rounded-xl border border-slate-200/80 bg-white/60 backdrop-blur-sm pl-9 pr-8 text-[11px] font-black text-slate-800 outline-none transition-all shadow-sm focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500" value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}>
                                    <option value="">Pilih Suku Cadang</option>
                                    {inventoryItems.map(it => <option key={it.id} value={it.id}>{it.nama}</option>)}
                                 </select>
                                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
                              </div>
                              <div className="flex gap-2">
                                 <div className="relative w-20">
                                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-blue-500 z-10" />
                                    <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="h-10 w-full rounded-xl text-right text-[11px] font-black border-slate-200/80 bg-white/60 backdrop-blur-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-3" placeholder="0" />
                                 </div>
                                 <Button onClick={handleAddUsage} disabled={busy || !selectedItemId} className="h-10 flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 px-4">
                                    <Plus className="size-4" /> 
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Tambah Barang</span>
                                 </Button>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="p-6 bg-white flex flex-col gap-3">
                     {canEdit ? (
                        <>
                           {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-bold border border-red-500/20">{error}</div>}
                           <Button onClick={() => setIsSubmitDialogOpen(true)} disabled={busy || acUnits.length === 0} className="w-full h-14 bg-[#66B21D] hover:bg-[#5aa11a] text-white rounded-2xl font-black uppercase tracking-[0.1em] shadow-xl shadow-green-500/20 transition-all active:scale-95 group text-xs">
                              Konfirmasi Estimasi
                              <ChevronRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                           </Button>
                        </>
                     ) : isStepKonfirmasi ? (
                        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                           <DialogTrigger asChild>
                              <Button disabled={busy} className="w-full h-14 bg-[#F8FAFC] text-slate-900 hover:bg-slate-100 rounded-2xl font-black uppercase tracking-[0.05em] shadow-lg transition-all active:scale-95 group text-xs text-balance border border-slate-200">
                                 Konfirmasi Pekerjaan
                                 <ChevronRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform text-[#66B21D]" />
                              </Button>
                           </DialogTrigger>
                           <DialogContent className="sm:max-w-[400px] rounded-3xl border-none p-0 overflow-hidden font-outfit shadow-2xl">
                              <div className="p-8 space-y-6">
                                 <div className="size-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
                                    <AlertCircle className="size-10" />
                                 </div>
                                 <div className="text-center space-y-3">
                                    <DialogHeader>
                                       <DialogTitle className="text-2xl font-black text-slate-900 text-center">Mulai Pengerjaan?</DialogTitle>
                                       <DialogDescription className="text-base font-bold text-slate-500 text-center leading-relaxed">
                                          Status pesanan akan diubah menjadi <span className="text-slate-900">Pengecekan Unit</span> dan dikirimkan ke pelanggan. Pastikan Anda siap memulai.
                                       </DialogDescription>
                                    </DialogHeader>
                                 </div>
                                 <div className="flex flex-col gap-3 pt-4">
                                    <Button onClick={handleConfirm} disabled={busy} className="h-14 bg-[#66B21D] hover:bg-[#5aa11a] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-green-500/20 transition-all active:scale-95">
                                       Ya, Simpan & Mulai
                                    </Button>
                                    <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} className="h-12 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px]">
                                       Batal
                                    </Button>
                                 </div>
                              </div>
                           </DialogContent>
                        </Dialog>
                     ) : (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                           <CheckCircle2 className="size-5 text-[#66B21D]" />
                           <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Estimasi telah dikirim. Menunggu konfirmasi pengerjaan dari pelanggan.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
         </div>
      </div>

      {/* Submission Confirmation Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
         <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
            <div className="bg-white p-8 space-y-6">
               <div className="size-16 rounded-3xl bg-green-50 text-[#66B21D] flex items-center justify-center mx-auto shadow-sm border border-green-100/50">
                  <CheckCircle2 className="size-8" />
               </div>
               
               <div className="space-y-2 text-center">
                  <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Kirim Estimasi?</DialogTitle>
                  <DialogDescription className="text-sm font-bold text-slate-500 font-medium leading-relaxed">
                     Data diagnosa dan rincian biaya akan segera dikirimkan kepada pelanggan untuk mendapatkan persetujuan.
                  </DialogDescription>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <Button 
                     variant="secondary" 
                     onClick={() => setIsSubmitDialogOpen(false)}
                     className="h-12 rounded-2xl font-black text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all border-none"
                     disabled={busy}
                  >
                     Batal
                  </Button>
                  <Button 
                     onClick={handleSubmit}
                     className="h-12 rounded-2xl font-black text-xs bg-[#66B21D] hover:bg-[#5aa11a] text-white shadow-lg shadow-[#66B21D]/20 transition-all active:scale-95 border-none"
                     disabled={busy}
                  >
                     {busy ? (
                        <div className="flex items-center gap-2">
                           <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Mengirim...
                        </div>
                     ) : (
                        "Lanjutkan"
                     )}
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  )
}
