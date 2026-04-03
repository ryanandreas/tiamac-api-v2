"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { 
  CalendarIcon, 
  User, 
  Settings, 
  Clock, 
  ChevronRight,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  ClipboardList,
  Plus,
  Trash2,
  Activity,
  Wind,
  Wrench
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { 
  updateServiceAction,
  adminAddAcUnit,
  adminAddUnitLayanan,
  adminRemoveUnitLayanan,
  adminAddMaterialUsage,
  adminRemoveMaterialUsage
} from "@/app/actions/admin-actions"

interface EditServiceFormProps {
  service: any
  technicians: any[]
  inventoryItems: any[]
  catalogRows: any[]
}

const STATUS_OPTIONS = [
  "Booking",
  "Menunggu Jadwal",
  "Teknisi Dikonfirmasi",
  "Dalam Pengecekan",
  "Menunggu Persetujuan Customer",
  "Sedang Dikerjakan",
  "Pekerjaan Selesai",
  "Menunggu Pembayaran",
  "Selesai (Garansi Aktif)",
  "Selesai",
  "Dibatalkan"
]

const JENIS_SERVIS_OPTIONS = [
  "AC",
  "Cuci AC",
  "Perbaikan AC",
  "Bongkar Pasang AC",
  "Lainnya"
]

export function EditServiceForm({ service, technicians, inventoryItems, catalogRows }: EditServiceFormProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states initialized with service data
  const [status, setStatus] = useState<string>(service.status_servis || "")
  const [jenisServis, setJenisServis] = useState<string>(service.jenis_servis || "")
  const [teknisiId, setTeknisiId] = useState<string>(service.teknisiId || "none")
  
  // Workstation interaction states
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [qty, setQty] = useState<string>("1")
  const [selectedUnitId, setSelectedUnitId] = useState<string>("")
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>("")
  const [newUnitPk, setNewUnitPk] = useState<string>("1")

  // Extract initial date from keluhan
  const initialDate = (() => {
    const keluhan = service.keluhan || ""
    const jadwalLine = keluhan.split("\n").find((l: string) => l.trim().toLowerCase().startsWith("jadwal:"))
    if (jadwalLine) {
      const dateStr = jadwalLine.replace(/jadwal:\s*/i, "").trim()
      const parsedDate = new Date(dateStr)
      return isNaN(parsedDate.getTime()) ? undefined : parsedDate
    }
    return undefined
  })()
  
  const [date, setDate] = useState<Date | undefined>(initialDate)

  // Calcs
  const materialTotal = useMemo(
    () => service.materialUsages.reduce((sum: number, u: any) => sum + u.qty * u.harga_satuan, 0),
    [service.materialUsages]
  )

  const layananTotal = useMemo(() => {
    return service.acUnits.reduce((sum: number, unit: any) => {
      return sum + unit.layanan.reduce((inner: number, l: any) => inner + l.harga, 0)
    }, 0)
  }, [service.acUnits])

  const biayaDasar = service.biaya_dasar ?? 50000
  const grandTotal = useMemo(() => {
    return biayaDasar + layananTotal + materialTotal
  }, [biayaDasar, layananTotal, materialTotal])

  const unitOptions = useMemo(() => {
    return service.acUnits.map((u: any, idx: number) => ({ id: u.id, label: `Unit ${idx + 1} (${u.pk} PK)`, pk: u.pk }))
  }, [service.acUnits])

  const selectedUnit = useMemo(() => service.acUnits.find((u: any) => u.id === selectedUnitId), [service.acUnits, selectedUnitId])

  const layananOptions = useMemo(() => {
    if (!selectedUnit) return []
    const pkKey = String(selectedUnit.pk)
    const usedCatalog = new Set(selectedUnit.layanan.map((l: any) => l.catalogId).filter(Boolean) as string[])
    return catalogRows
      .filter((r) => r.pk === null || r.pk === pkKey)
      .filter((r) => !usedCatalog.has(r.uuid))
      .map((r) => ({
        uuid: r.uuid,
        label: `${r.nama} (Rp ${r.harga.toLocaleString("id-ID")})`,
      }))
  }, [catalogRows, selectedUnit])

  // --- Handlers ---
  const handleGeneralSave = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await updateServiceAction({
        serviceId: service.id,
        status_servis: status,
        jenis_servis: jenisServis,
        teknisiId: teknisiId === "none" ? "" : teknisiId,
        jadwal_tanggal: date ? format(date, "yyyy-MM-dd") : undefined
      })
      if (!res?.success) setError(res?.message || "Gagal memperbarui pesanan")
      router.refresh()
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan sistem")
    } finally {
      setBusy(false)
    }
  }

  const handleAddAcUnit = async () => {
    setBusy(true)
    try {
      const res = await adminAddAcUnit({ serviceId: service.id, pk: Number(newUnitPk) })
      if (!res?.success) setError(res?.message || "Gagal menambah unit")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const handleAddLayanan = async () => {
    if (!selectedCatalogId || !selectedUnitId) return
    setBusy(true)
    try {
      const res = await adminAddUnitLayanan({ serviceId: service.id, unitId: selectedUnitId, catalogId: selectedCatalogId })
      if (!res?.success) setError(res?.message || "Gagal menambah layanan")
      setSelectedCatalogId("")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const handleAddUsage = async () => {
    if (!selectedItemId) return
    setBusy(true)
    try {
      const res = await adminAddMaterialUsage({ serviceId: service.id, itemId: selectedItemId, qty: Number(qty) })
      if (!res?.success) setError(res?.message || "Gagal menambah material")
      setSelectedItemId("")
      setQty("1")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  // --- Render ---
  return (
    <div className="bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-slate-200/50 overflow-hidden pb-32">
      <div className="p-8 md:p-12 space-y-12">
        {/* 1. Info Bar Segment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: User, label: "Pelanggan", value: service.customer?.name, color: "text-blue-500", bg: "bg-blue-50/50" },
            { icon: Wrench, label: "Teknisi", value: technicians.find(t => t.id === teknisiId)?.name || "Belum ditugaskan", color: "text-[#66B21D]", bg: "bg-green-50/50" },
            { icon: MapPin, label: "Lokasi", value: service.customer?.customerProfile?.alamat || "Jakarta Barat", color: "text-amber-500", bg: "bg-amber-50/50" }
          ].map((item, i) => (
            <div key={i} className={cn("rounded-[28px] p-5 border border-slate-50/50 flex items-center gap-5 group transition-all", item.bg)}>
              <div className={cn("size-12 rounded-2xl bg-white flex items-center justify-center shadow-sm", item.color)}>
                <item.icon className="size-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</span>
                <span className="text-base font-black text-slate-900 truncate leading-tight">{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Action Area (Left) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Section 1: Admin Diagnostic Controls */}
            <div className="bg-slate-50/30 rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-8">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100/50">
                <Settings className="size-5 text-[#66B21D]" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Main <span className="text-slate-400">Diagnostic Override</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Field */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Status Workflow</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-14 border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-all font-black text-slate-900 px-5 text-xs shadow-sm">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[240px]">
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="rounded-xl px-4 py-3 text-xs font-black text-slate-700 data-[highlighted]:bg-green-50 data-[highlighted]:text-[#66B21D]">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Technician Assign Field */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Field Staff</Label>
                  <Select value={teknisiId} onValueChange={setTeknisiId}>
                    <SelectTrigger className="h-14 border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-all font-black text-slate-900 px-5 text-xs shadow-sm">
                      <SelectValue placeholder="Assign Teknisi" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[240px]">
                      <SelectItem value="none" className="rounded-xl px-4 py-3 text-xs font-black text-slate-400 italic">Belum ditugaskan</SelectItem>
                      {technicians.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="rounded-xl px-4 py-3 text-xs font-black text-slate-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-600">
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Schedule Date Field */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Operation Schedule</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-14 justify-start text-left font-black border-slate-200 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 transition-all px-5 text-xs shadow-sm",
                          !date && "text-slate-400"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-4 w-4 text-slate-400" />
                        {date ? format(date, "PPP") : <span>Set Schedule Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-slate-100 rounded-[28px] overflow-hidden shadow-2xl" align="end">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-4 bg-white" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Section 2: Unified 'Customer-Friendly' Service & Material List */}
            <div className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-[#66B21D]/10 text-[#66B21D] flex items-center justify-center shadow-inner">
                        <ClipboardList className="size-6" />
                      </div>
                      <div className="flex flex-col">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Rincian Pekerjaan & Suku Cadang</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail teknis dan material terpakai</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white rounded-xl border border-slate-100 p-1.5 shadow-sm">
                        <select 
                          className="h-9 px-3 rounded-lg bg-transparent text-[11px] font-black text-slate-900 outline-none"
                          value={newUnitPk}
                          onChange={(e) => setNewUnitPk(e.target.value)}
                        >
                          <option value="0.5">0.5 PK</option>
                          <option value="1">1.0 PK</option>
                          <option value="1.5">1.5 PK</option>
                          <option value="2">2.0 PK</option>
                        </select>
                        <Button onClick={handleAddAcUnit} disabled={busy} className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                          Tambah Unit
                        </Button>
                      </div>
                  </div>
                </div>

                <div className="p-0">
                  <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50">
                            <th className="text-left py-4 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deskripsi Layanan / Item</th>
                            <th className="text-center py-4 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Qty</th>
                            <th className="text-right py-4 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Harga</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/50">
                        {/* 2A. Unit Groupings */}
                        {service.acUnits.map((unit: any, uIdx: number) => (
                          <React.Fragment key={unit.id}>
                            {/* Unit Sub-Header Row */}
                            <tr className="bg-slate-50/20">
                              <td colSpan={3} className="py-5 px-10">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                                      <Wind className="size-5" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-black text-slate-900">AC Unit #{uIdx + 1}</span>
                                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest tracking-tighter">Spec: {unit.pk} PK</span>
                                    </div>
                                  </div>
                                  <Badge className="bg-blue-50 text-blue-600 border-blue-100 rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest shadow-sm">
                                    Pemeriksaan Aktif
                                  </Badge>
                                </div>
                              </td>
                            </tr>

                            {/* Service Items for this Unit */}
                            {unit.layanan.map((l: any) => (
                              <tr key={l.id} className="group hover:bg-slate-50/50 transition-colors border-l-4 border-l-transparent hover:border-l-[#66B21D]">
                                <td className="py-5 px-10 pl-20">
                                  <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-[#66B21D]" />
                                    <span className="text-xs font-black text-slate-700">{l.nama}</span>
                                  </div>
                                </td>
                                <td className="py-5 px-10 text-center font-bold text-slate-400 text-xs">1 x</td>
                                <td className="py-5 px-10 text-right">
                                  <div className="flex items-center justify-end gap-5">
                                    <span className="text-xs font-black text-slate-900">Rp {l.harga.toLocaleString("id-ID")}</span>
                                    <button 
                                      onClick={() => adminRemoveUnitLayanan({ unitLayananId: l.id, serviceId: service.id })} 
                                      className="size-8 rounded-xl bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {/* Add Layanan for this Unit Input */}
                            <tr className="bg-white">
                              <td colSpan={3} className="py-4 px-10 pl-20">
                                <div className="flex gap-3 max-w-xl">
                                  <select 
                                    className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-[11px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#66B21D] shadow-sm"
                                    value={selectedUnitId === unit.id ? selectedCatalogId : ""}
                                    onFocus={() => setSelectedUnitId(unit.id)}
                                    onChange={(e) => setSelectedCatalogId(e.target.value)}
                                  >
                                    <option value="">+ Tambah Pekerjaan untuk Unit #{uIdx + 1}...</option>
                                    {catalogRows
                                        .filter(r => r.pk === null || r.pk === String(unit.pk))
                                        .filter(r => !unit.layanan.find((ul: any) => ul.catalogId === r.uuid))
                                        .map(r => <option key={r.uuid} value={r.uuid}>{r.nama} (Rp {r.harga.toLocaleString("id-ID")})</option>)}
                                  </select>
                                  <Button 
                                    onClick={handleAddLayanan} 
                                    disabled={busy || selectedUnitId !== unit.id || !selectedCatalogId} 
                                    className="h-12 px-6 rounded-2xl bg-[#66B21D] hover:bg-[#5aa11a] text-white font-black shadow-xl shadow-green-500/20 active:scale-95 transition-all"
                                  >
                                    <Plus className="size-4 mr-2" />
                                    Tambah
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            {/* Visual Spacer */}
                            <tr className="h-6"><td colSpan={3}></td></tr>
                          </React.Fragment>
                        ))}

                        {/* 2B. Material & Spareparts Grouping */}
                        <tr className="bg-slate-50/20 border-t-2 border-slate-100/50">
                          <td colSpan={3} className="py-8 px-10">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Wrench className="size-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Material & Suku Cadang</span>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest tracking-tighter">Penggunaan Spareparts Tambahan</span>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {service.materialUsages.map((mu: any) => (
                          <tr key={mu.id} className="group hover:bg-slate-50/50 transition-colors border-l-4 border-l-transparent hover:border-l-blue-500">
                            <td className="py-5 px-10 pl-20">
                              <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-blue-500" />
                                <span className="text-xs font-black text-slate-700">{mu.item.nama}</span>
                              </div>
                            </td>
                            <td className="py-5 px-10 text-center font-black text-slate-400 text-xs">{mu.qty} {mu.item.uom}</td>
                            <td className="py-5 px-10 text-right">
                              <div className="flex items-center justify-end gap-5">
                                <span className="text-xs font-black text-slate-900">Rp {(mu.qty * mu.harga_satuan).toLocaleString("id-ID")}</span>
                                <button 
                                  onClick={() => adminRemoveMaterialUsage({ usageId: mu.id, serviceId: service.id })}
                                  className="size-8 rounded-xl bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* Add Material Input */}
                        <tr className="bg-white">
                          <td colSpan={3} className="py-8 px-10 pl-20">
                            <div className="flex items-end gap-4 max-w-2xl bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 shadow-inner">
                                <div className="flex-1 space-y-2">
                                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Katalog Suku Cadang</Label>
                                  <select 
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                    value={selectedItemId}
                                    onChange={(e) => setSelectedItemId(e.target.value)}
                                  >
                                    <option value="">Pilih Material...</option>
                                    {inventoryItems.map(item => <option key={item.id} value={item.id}>{item.nama} (Stok: {item.qtyOnHand})</option>)}
                                  </select>
                                </div>
                                <div className="w-32 space-y-2">
                                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</Label>
                                  <Input 
                                    type="number" 
                                    value={qty} 
                                    onChange={(e) => setQty(e.target.value)} 
                                    className="h-12 rounded-xl border-slate-200 bg-white text-center font-black text-slate-900 shadow-sm" 
                                    placeholder="0" 
                                  />
                                </div>
                                <Button 
                                  onClick={handleAddUsage} 
                                  disabled={busy || !selectedItemId} 
                                  className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                                >
                                  <Plus className="size-4 mr-2" />
                                  Tambah Material
                                </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                  </table>
                </div>
            </div>
          </div>

          {/* Right Summary Sidebar (Sticky) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="bg-slate-900 rounded-[35px] shadow-2xl p-10 text-white space-y-10 relative overflow-hidden border-4 border-slate-800/50">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Settings className="size-24 rotate-12" />
              </div>
              
              <div className="space-y-5">
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Estimasi Tagihan</h2>
                <div className="flex flex-col">
                  <span className="text-5xl font-black tracking-tighter leading-none">Rp {grandTotal.toLocaleString("id-ID")}</span>
                  <span className="text-[10px] font-bold text-[#66B21D] flex items-center gap-2 mt-4">
                    <Activity className="size-3.5" />
                    Real-time audit calculate active
                  </span>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div className="space-y-7">
                <div className="flex justify-between items-center opacity-60">
                  <span className="text-[10px] font-black uppercase tracking-widest">Pemeriksaan</span>
                  <span className="text-base font-bold">Rp {biayaDasar.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center opacity-60">
                  <span className="text-[10px] font-black uppercase tracking-widest">Unit & Layanan</span>
                  <span className="text-base font-bold">Rp {layananTotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#66B21D]">Material</span>
                  <span className="text-base font-black text-[#66B21D]">Rp {materialTotal.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={handleGeneralSave} 
                  disabled={busy} 
                  className="w-full h-18 bg-[#66B21D] hover:bg-[#5aa11a] text-white rounded-[24px] font-black uppercase tracking-[0.15em] shadow-2xl shadow-green-500/40 transition-all active:scale-95 group text-sm"
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Save className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />}
                  Simpan Perubahan
                </Button>
              </div>
            </div>

            {/* Keluhan Card */}
            <div className="bg-slate-50/50 rounded-[32px] border border-slate-100 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <ClipboardList className="size-4 text-slate-400" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Catatan Keluhan</h4>
              </div>
              <p className="text-xs font-medium text-slate-500 leading-relaxed italic border-l-4 border-slate-200 pl-4">
                "{service.keluhan?.split("\n")[0] || "Tidak ada deskripsi keluhan tertulis dari pelanggan."}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
