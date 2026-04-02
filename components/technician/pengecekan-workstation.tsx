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
  Wind
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import {
  addMaterialUsage,
  addUnitLayanan,
  addAcUnit,
  removeMaterialUsage,
  removeUnitLayanan,
  submitPengecekan,
  startPengecekan,
} from "@/app/actions/teknisi"
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
type ServiceUnit = { id: string; pk: number; layanan: UnitLayanan[] }
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

  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [qty, setQty] = useState<string>("1")
  const [selectedUnitId, setSelectedUnitId] = useState<string>("")
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>("")
  const [newUnitPk, setNewUnitPk] = useState<string>("1")

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
  const isStepPengecekan = statusServis === "Pengecekan Unit"
  const canEdit = isStepPengecekan

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
      if (!res?.success) setError(res?.message ?? "Gagal konfirmasi.")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleAddAcUnit() {
    setBusy(true)
    setError(null)
    try {
      const res = await addAcUnit({ serviceId, pk: Number(newUnitPk) })
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
      router.push("/dashboard/ongoing")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in font-outfit pb-24">
      {/* 1. Slim Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <Badge className="bg-[#66B21D]/10 text-[#66B21D] border-none shadow-none font-black text-[10px] uppercase tracking-widest h-7 px-4 rounded-full">
               Workstation Diagnostic
             </Badge>
             <span className="text-slate-300 font-bold">•</span>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order ID #{serviceId.slice(0, 8).toUpperCase()}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Diagnostic Terminal</h1>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="bg-white border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest h-10 px-5 rounded-2xl shadow-sm">
             {statusServis}
           </Badge>
        </div>
      </div>

      {/* 2. Main Page Card */}
      <div className="bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 md:p-12 space-y-12">
          {/* Info Bar Segment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { icon: User, label: "Pelanggan", value: customerName, color: "text-blue-500", bg: "bg-blue-50/50" },
               { icon: Wrench, label: "Teknisi", value: teknisiName, color: "text-[#66B21D]", bg: "bg-green-50/50" },
               { icon: MapPin, label: "Lokasi", value: customerAlamat, color: "text-amber-500", bg: "bg-amber-50/50" }
             ].map((item, i) => (
               <div key={i} className={cn("rounded-[28px] p-5 border border-slate-50/50 flex items-center gap-5 group transition-all", item.bg)}>
                  <div className={cn("size-12 rounded-2xl bg-white flex items-center justify-center shadow-sm", item.color)}>
                     <item.icon className="size-6" />
                  </div>
                  <div className="flex flex-col min-w-0">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</span>
                     <span className="text-base font-black text-slate-900 truncate">{item.value}</span>
                  </div>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* 3. Main Action Area (Left) */}
            <div className="lg:col-span-8 space-y-10">
               {/* Billing & Estimate Dashboard */}
               <div className="bg-slate-50/30 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Activity className="size-5 text-[#66B21D]" />
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Rincian Estimasi Biaya</h2>
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock className="size-4 text-slate-300" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{jadwal || "Sesuai Pesanan"}</span>
                     </div>
                  </div>

                  <div className="p-0 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white/50 border-b border-slate-50">
                          <th className="text-left py-4 px-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Pekerjaan & Suku Cadang</th>
                          <th className="text-center py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Qty</th>
                          <th className="text-right py-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Harga</th>
                          <th className="text-right py-4 px-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {/* Fixed Standard Fee */}
                        <tr className="hover:bg-white/40 transition-colors">
                          <td className="py-6 px-8">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900">Biaya Kunjungan & Pemeriksaan</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight opacity-60">Pemeriksaan Unit Standar</span>
                            </div>
                          </td>
                          <td className="py-6 px-4 text-center">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-black h-6 px-3 rounded-lg border-none">1x</Badge>
                          </td>
                          <td className="py-6 px-4 text-right text-xs font-bold text-slate-400">Rp {biayaDasar.toLocaleString("id-ID")}</td>
                          <td className="py-6 px-8 text-right text-sm font-black text-slate-900">Rp {biayaDasar.toLocaleString("id-ID")}</td>
                        </tr>

                        {/* Services Loop */}
                        {acUnits.flatMap((unit, uIdx) => 
                          unit.layanan.map((l) => (
                            <tr key={l.id} className="group hover:bg-white/40 transition-colors">
                              <td className="py-6 px-8">
                                <div className="flex items-center gap-3">
                                   <div className="size-9 rounded-xl bg-green-50 text-[#66B21D] flex items-center justify-center text-[10px] font-black shrink-0 border border-green-100/50">AC {uIdx + 1}</div>
                                   <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-black text-slate-900 truncate">{l.nama}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight opacity-60">{unit.pk} PK Unit</span>
                                   </div>
                                </div>
                              </td>
                              <td className="py-6 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                   <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-black h-6 px-3 rounded-lg border-none">1x</Badge>
                                   {canEdit && (
                                     <button onClick={() => removeUnitLayanan({ unitLayananId: l.id })} className="size-7 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                       <Trash2 className="size-4" />
                                     </button>
                                   )}
                                </div>
                              </td>
                              <td className="py-6 px-4 text-right text-xs font-bold text-slate-400">Rp {l.harga.toLocaleString("id-ID")}</td>
                              <td className="py-6 px-8 text-right text-sm font-black text-slate-900">Rp {l.harga.toLocaleString("id-ID")}</td>
                            </tr>
                          ))
                        )}

                        {/* Spareparts Loop */}
                        {usages.map((u) => (
                          <tr key={u.id} className="group hover:bg-white/40 transition-colors">
                            <td className="py-6 px-8">
                              <div className="flex items-center gap-3">
                                 <div className="size-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100/50"><Wrench className="size-4" /></div>
                                 <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-black text-slate-900 truncate">{u.item.nama}</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight opacity-60">Suku Cadang</span>
                                 </div>
                              </div>
                            </td>
                            <td className="py-6 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                 <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-black h-6 px-3 rounded-lg border-none">{u.qty}x</Badge>
                                 {canEdit && (
                                   <button onClick={() => removeMaterialUsage({ usageId: u.id })} className="size-7 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                     <Trash2 className="size-4" />
                                   </button>
                                 )}
                              </div>
                            </td>
                            <td className="py-6 px-4 text-right text-xs font-bold text-slate-400">Rp {u.harga_satuan.toLocaleString("id-ID")}</td>
                            <td className="py-6 px-8 text-right text-sm font-black text-slate-900">Rp {(u.qty * u.harga_satuan).toLocaleString("id-ID")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Enhanced Action Panel */}
                  {isStepPengecekan && (
                    <div className="p-8 bg-white/40 border-t border-slate-50 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Block 1: New Unit */}
                          <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <Wind className="size-3.5 text-amber-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tambah Unit Baru</span>
                             </div>
                             <div className="flex gap-2">
                                <select className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm" value={newUnitPk} onChange={(e) => setNewUnitPk(e.target.value)}>
                                   <option value="0.5">0.5 PK</option>
                                   <option value="0.75">0.75 PK</option>
                                   <option value="1">1.0 PK</option>
                                   <option value="1.5">1.5 PK</option>
                                   <option value="2">2.0 PK</option>
                                   <option value="2.5">2.5 PK</option>
                                </select>
                                <Button onClick={handleAddAcUnit} disabled={busy} className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 shadow-lg shadow-slate-900/10">
                                   <Plus className="size-4" />
                                </Button>
                             </div>
                          </div>

                          {/* Block 2: Services */}
                          <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <Plus className="size-3.5 text-[#66B21D]" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tambah Layanan</span>
                             </div>
                             <div className="grid grid-cols-1 gap-2">
                                <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#66B21D] transition-all shadow-sm" value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)}>
                                   <option value="">Pilih Unit...</option>
                                   {unitOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                                </select>
                                <div className="flex gap-2">
                                   <select className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#66B21D] transition-all shadow-sm" value={selectedCatalogId} onChange={(e) => setSelectedCatalogId(e.target.value)} disabled={!selectedUnitId}>
                                      <option value="">Cari Layanan...</option>
                                      {layananOptions.map(o => <option key={o.uuid} value={o.uuid}>{o.label}</option>)}
                                   </select>
                                   <Button onClick={handleAddLayanan} disabled={busy || !selectedCatalogId} className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 shadow-lg shadow-slate-900/10">
                                      <Plus className="size-4" />
                                   </Button>
                                </div>
                             </div>
                          </div>

                          {/* Block 3: Spareparts */}
                          <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <Plus className="size-3.5 text-blue-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Suku Cadang</span>
                             </div>
                             <div className="grid grid-cols-1 gap-2">
                                <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}>
                                   <option value="">Pilih Barang...</option>
                                   {inventoryItems.map(it => <option key={it.id} value={it.id}>{it.nama}</option>)}
                                </select>
                                <div className="flex gap-2">
                                   <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="h-11 w-20 rounded-xl text-center text-[10px] font-black border-slate-200 shadow-sm" placeholder="Qty" />
                                   <Button onClick={handleAddUsage} disabled={busy || !selectedItemId} className="h-11 flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 shadow-lg shadow-slate-900/10">
                                      <Plus className="size-4 mr-2" /> 
                                      Tambah
                                   </Button>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
               </div>

               {/* Pro Support Card */}
               <div className="bg-[#66B21D]/5 border border-dashed border-[#66B21D]/30 p-8 rounded-[32px] flex items-center gap-6">
                  <div className="size-14 rounded-2xl bg-[#66B21D]/10 text-[#66B21D] flex items-center justify-center shrink-0">
                     <AlertCircle className="size-7" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-sm font-black text-slate-900">Diagnosis Workstation Standard</h4>
                     <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-[500px]">Pastikan jumlah unit dan jenis layanan telah disesuaikan sebelum menekan tombol konfirmasi untuk mengirimkan estimasi ke pelanggan.</p>
                  </div>
               </div>
            </div>

            {/* 4. Sticky Summary Sidebar (Right) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
               <div className="bg-slate-900 rounded-[35px] shadow-2xl overflow-hidden p-10 text-white space-y-10 relative border-4 border-slate-800/50">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <CreditCard className="size-24 rotate-12" />
                  </div>
                  
                  <div className="space-y-5">
                     <h2 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Estimasi Tagihan</h2>
                     <div className="flex flex-col">
                        <span className="text-5xl font-black tracking-tight leading-tight">Rp {grandTotal.toLocaleString("id-ID")}</span>
                        <span className="text-[10px] font-bold text-green-400 mt-4 flex items-center gap-2">
                           <CheckCircle2 className="size-3.5" />
                           Harga mencakup seluruh update pengerjaan
                        </span>
                     </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="space-y-7">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Biaya Pemeriksaan</span>
                        <span className="text-base font-bold">Rp {biayaDasar.toLocaleString("id-ID")}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Update Layanan</span>
                        <span className="text-base font-bold">Rp {layananTotal.toLocaleString("id-ID")}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Suku Cadang</span>
                        <span className="text-base font-bold">Rp {materialTotal.toLocaleString("id-ID")}</span>
                     </div>
                  </div>

                  {canEdit ? (
                    <div className="pt-6">
                      {error && <div className="mb-4 p-4 bg-red-500/10 text-red-500 rounded-xl text-[11px] font-bold border border-red-500/20">{error}</div>}
                      <Button 
                        onClick={handleSubmit} 
                        disabled={busy} 
                        className="w-full h-18 bg-[#66B21D] hover:bg-[#5aa11a] text-white rounded-[24px] font-black uppercase tracking-[0.15em] shadow-2xl shadow-green-500/40 transition-all active:scale-95 group text-sm"
                      >
                        Konfirmasi
                        <ChevronRight className="ml-2 size-6 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  ) : isStepKonfirmasi ? (
                    <Button 
                      onClick={handleConfirm}
                      disabled={busy}
                      className="w-full h-16 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black uppercase tracking-[0.1em] shadow-xl transition-all active:scale-95 group"
                    >
                      Konfirmasi Pekerjaan
                      <ChevronRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform text-[#66B21D]" />
                    </Button>
                  ) : (
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-4">
                       <CheckCircle2 className="size-6 text-green-400 shrink-0" />
                       <p className="text-[11px] font-bold opacity-60 leading-relaxed text-balance text-left tracking-tight">Estimasi telah dikirim ke pelanggan. Terminal pengerjaan akan aktif setelah pelanggan melakukan konfirmasi.</p>
                    </div>
                  )}
               </div>

               {/* Progress Tracker */}
               <div className="bg-slate-50/50 rounded-[32px] border border-slate-100 p-8 space-y-6">
                  <div className="flex items-center gap-3">
                     <History className="size-4 text-slate-400" />
                     <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest tracking-tight">Status Log</h4>
                  </div>
                  <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
                     {statusHistory.slice(0, 3).map((h, i) => (
                       <div key={h.id} className="relative pl-7">
                          <div className={cn("absolute left-0 top-1.5 size-3.5 rounded-full border-2 bg-white z-10", i === 0 ? "border-[#66B21D]" : "border-slate-200")} />
                          <div className="flex flex-col min-w-0">
                             <span className={cn("text-[11px] font-black uppercase tracking-tight truncate", i === 0 ? "text-slate-900" : "text-slate-400")}>{h.status}</span>
                             <span className="text-[9px] font-bold text-slate-400">{format(new Date(h.createdAt), "dd MMM, HH:mm", { locale: id })}</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
