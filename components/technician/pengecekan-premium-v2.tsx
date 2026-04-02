"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  User, 
  Wrench, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  Plus,
  Trash2,
  FileText
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import {
  addMaterialUsage,
  addUnitLayanan,
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

export function PengecekanPremiumV2({
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
  const [notes, setNotes] = useState<string>("")
  const [diagnosa, setDiagnosa] = useState<string>("")
  const [jasaTambahan, setJasaTambahan] = useState<string>("0")

  const [selectedUnitId, setSelectedUnitId] = useState<string>("")
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>("")

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
    const jasa = Math.floor(Number(jasaTambahan))
    return biayaDasar + layananTotal + materialTotal + (isNaN(jasa) ? 0 : jasa)
  }, [biayaDasar, layananTotal, materialTotal, jasaTambahan])

  const isStepKonfirmasi = statusServis === "Konfirmasi Teknisi"
  const isStepPengecekan = statusServis === "Pengecekan Unit"
  const canEdit = isStepPengecekan

  const unitOptions = useMemo(() => {
    return acUnits.map((u, idx) => ({ id: u.id, label: `AC ${idx + 1} (${u.pk} PK)` }))
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

  async function handleAddLayanan() {
    if (!selectedCatalogId || !selectedUnitId) return
    setBusy(true)
    setError(null)
    try {
      const res = await addUnitLayanan({
        unitId: selectedUnitId,
        catalogId: selectedCatalogId,
      })
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
        notes: notes.trim() || undefined,
      })
      if (!res?.success) setError(res?.message ?? "Gagal menambah barang.")
      setSelectedItemId("")
      setQty("1")
      setNotes("")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit() {
    setBusy(true)
    setError(null)
    try {
      const res = await submitPengecekan({
        serviceId,
        diagnosa,
        jasaTambahan: Number(jasaTambahan),
      })
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
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section following /dashboard/tugas pattern */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Detail Pengerjaan</h1>
            <Badge variant="outline" className="bg-white/50 backdrop-blur-sm border-slate-200 text-[10px] font-bold uppercase tracking-widest h-6 px-3">
              Order #{serviceId.slice(0, 8).toUpperCase()}
            </Badge>
          </div>
          <p className="text-slate-500 font-medium text-base flex items-center gap-2">
            Status: <span className="text-[#66B21D] font-bold">{statusServis}</span>
          </p>
        </div>
      </div>

      {/* Card Wrapper following /dashboard/tugas */}
      <div className="bg-white rounded-3xl border-0 shadow-none overflow-hidden pb-12">
        <div className="p-8 space-y-8">
          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-[#66B21D]/20 transition-all duration-300">
              <div className="size-14 rounded-2xl bg-white flex items-center justify-center text-slate-400 font-black text-lg group-hover:text-[#66B21D] transition-colors shadow-sm">
                {customerName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pelanggan</span>
                <span className="text-base font-black text-slate-900">{customerName}</span>
              </div>
            </div>

            <div className="bg-[#66B21D]/5 rounded-3xl p-6 border border-[#66B21D]/10 shadow-sm flex items-center gap-5">
              <div className="size-14 rounded-2xl bg-[#66B21D] flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                <Wrench className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#66B21D] uppercase tracking-widest opacity-60">Teknisi Bertugas</span>
                <span className="text-base font-black text-slate-900">{teknisiName}</span>
              </div>
            </div>

            <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-100 shadow-sm flex items-center gap-5">
              <div className="size-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <MapPin className="size-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest opacity-60">Lokasi Pengerjaan</span>
                <span className="text-sm font-black text-slate-900 truncate" title={customerAlamat}>{customerAlamat}</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Rincian Pengerjaan & Suku Cadang</h2>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-slate-300" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{jadwal || "-"}</span>
              </div>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Pekerjaan</th>
                    <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah</th>
                    <th className="text-right py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                    <th className="text-right py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr className="group hover:bg-slate-50/30 transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">Biaya Kunjungan & Pemeriksaan</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Standar pemeriksaan unit & transportasi</span>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <Badge variant="outline" className="bg-slate-50 border-slate-200 text-[10px] font-black h-6 px-3">1x</Badge>
                    </td>
                    <td className="py-6 px-4 text-right text-sm font-bold text-slate-400">Rp {biayaDasar.toLocaleString("id-ID")}</td>
                    <td className="py-6 px-8 text-right text-sm font-black text-slate-900">Rp {biayaDasar.toLocaleString("id-ID")}</td>
                  </tr>

                  {acUnits.flatMap((unit, uIdx) => 
                    unit.layanan.map((l) => (
                      <tr key={l.id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="py-6 px-8">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">{l.nama}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Unit AC {uIdx + 1} ({unit.pk} PK)</span>
                          </div>
                        </td>
                        <td className="py-6 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <Badge variant="outline" className="bg-slate-50 border-slate-200 text-[10px] font-black h-6 px-3">1x</Badge>
                             {canEdit && (
                               <button 
                                onClick={() => removeUnitLayanan({ unitLayananId: l.id })}
                                className="size-6 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                               >
                                <Trash2 className="size-3.5" />
                               </button>
                             )}
                          </div>
                        </td>
                        <td className="py-6 px-4 text-right text-sm font-bold text-slate-400">Rp {l.harga.toLocaleString("id-ID")}</td>
                        <td className="py-6 px-8 text-right text-sm font-black text-slate-900">Rp {l.harga.toLocaleString("id-ID")}</td>
                      </tr>
                    ))
                  )}

                  {usages.map((u) => (
                    <tr key={u.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="py-6 px-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900">{u.item.nama}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{u.notes || "Suku Cadang / Material Tambahan"}</span>
                        </div>
                      </td>
                      <td className="py-6 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <Badge variant="outline" className="bg-slate-50 border-slate-200 text-[10px] font-black h-6 px-3">{u.qty}x</Badge>
                           {canEdit && (
                             <button 
                              onClick={() => removeMaterialUsage({ usageId: u.id })}
                              className="size-6 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                             >
                              <Trash2 className="size-3.5" />
                             </button>
                           )}
                        </div>
                      </td>
                      <td className="py-6 px-4 text-right text-sm font-bold text-slate-400">Rp {u.harga_satuan.toLocaleString("id-ID")}</td>
                      <td className="py-6 px-8 text-right text-sm font-black text-slate-900">Rp {(u.qty * u.harga_satuan).toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-8 bg-slate-900 flex items-center justify-between text-white">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Total Pembayaran</span>
              <span className="text-3xl font-black tracking-tight">Rp {grandTotal.toLocaleString("id-ID")}</span>
            </div>

            {isStepPengecekan && (
              <div className="p-8 space-y-8 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Wrench className="size-3.5" />
                      Tambah Layanan Servis
                    </h3>
                    <div className="flex flex-col gap-3">
                      <select
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#66B21D] outline-none transition-all"
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(e.target.value)}
                        disabled={busy}
                      >
                        <option value="">Pilih Unit AC...</option>
                        {unitOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                      <select
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#66B21D] outline-none transition-all"
                        value={selectedCatalogId}
                        onChange={(e) => setSelectedCatalogId(e.target.value)}
                        disabled={busy || !selectedUnitId}
                      >
                        <option value="">{selectedUnitId ? "Pilih Jenis Layanan..." : "Pilih Unit Dulu"}</option>
                        {layananOptions.map(o => <option key={o.uuid} value={o.uuid}>{o.label}</option>)}
                      </select>
                      <Button variant="outline" onClick={handleAddLayanan} disabled={busy || !selectedCatalogId} className="h-12 rounded-2xl border-dashed border-slate-300">
                        <Plus className="mr-2 size-4" /> Tambah Layanan
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Plus className="size-3.5" />
                      Tambah Suku Cadang
                    </h3>
                    <div className="flex flex-col gap-3">
                      <select
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#66B21D] outline-none transition-all"
                        value={selectedItemId}
                        onChange={(e) => setSelectedItemId(e.target.value)}
                        disabled={busy}
                      >
                        <option value="">Pilih Sparepart...</option>
                        {inventoryItems.map(it => (
                          <option key={it.id} value={it.id}>
                            {it.nama} (Rp {it.harga.toLocaleString("id-ID")})
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-3">
                        <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="h-12 w-24 rounded-2xl" placeholder="Qty" />
                        <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="h-12 flex-1 rounded-2xl" placeholder="Catatan" />
                      </div>
                      <Button variant="outline" onClick={handleAddUsage} disabled={busy || !selectedItemId} className="h-12 rounded-2xl border-dashed border-slate-300">
                        <Plus className="mr-2 size-4" /> Tambah Sparepart
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="space-y-6">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="size-3.5" />
                    Diagnosa & Estimasi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8">
                       <Textarea 
                        placeholder="Hasil diagnosa..."
                        className="min-h-[120px] rounded-[32px] p-6"
                        value={diagnosa}
                        onChange={(e) => setDiagnosa(e.target.value)}
                       />
                    </div>
                    <div className="md:col-span-4">
                       <div className="bg-white p-6 rounded-3xl border border-slate-200">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Jasa Tambahan</label>
                          <Input type="number" value={jasaTambahan} onChange={(e) => setJasaTambahan(e.target.value)} className="h-12 rounded-2xl" />
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                      {error && <div className="mb-4 text-red-500 font-bold">{error}</div>}
                      <Button onClick={handleSubmit} disabled={busy || !diagnosa.trim()} className="h-16 px-12 bg-[#66B21D] text-white rounded-2xl font-black uppercase tracking-widest w-full md:w-auto">
                        Kirim Estimasi & Selesai Pengecekan
                      </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isStepKonfirmasi && (
            <div className="flex flex-col items-center pt-8 border-t border-slate-50">
               <Button 
                onClick={handleConfirm}
                disabled={busy}
                className="h-16 px-12 bg-[#66B21D] hover:bg-[#5aa11a] text-white rounded-2xl font-bold text-base uppercase tracking-widest shadow-xl shadow-green-500/10 group transition-all w-full md:w-auto"
              >
                Konfirmasi & Mulai Pengecekan
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

          <div className="bg-[#66B21D]/5 border border-dashed border-[#66B21D]/30 p-8 rounded-[32px] flex items-center gap-6">
             <CheckCircle2 className="size-10 text-[#66B21D]" />
             <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">Garansi Pekerjaan Aktif</h4>
                <p className="text-xs font-bold text-slate-500">Layanan ini dilindungi garansi resmi TIAM AC selama 30 hari.</p>
             </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8 overflow-y-auto max-h-[calc(100vh-100px)] px-2">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-8">
             <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Riwayat Status</h2>
             <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
                {statusHistory.map((h, i) => (
                  <div key={h.id} className="relative pl-10 group">
                     <div className={cn("absolute left-0 top-1.5 size-6 rounded-full border-2 bg-white flex items-center justify-center z-10", i === 0 ? "border-[#66B21D]" : "border-slate-100")}>
                        {i === 0 && <CheckCircle2 className="size-3 text-[#66B21D]" />}
                     </div>
                     <div className="space-y-1">
                        <h3 className={cn("text-sm font-black", i === 0 ? "text-slate-900" : "text-slate-400")}>{h.status}</h3>
                        <div className="text-[10px] font-black text-slate-300 uppercase">{format(new Date(h.createdAt), "dd MMM, HH:mm", { locale: id })}</div>
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
