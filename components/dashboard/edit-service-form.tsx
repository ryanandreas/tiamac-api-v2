"use client"

import { useMemo, useState } from "react"
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
    <div className="flex flex-col min-h-screen -mt-4 bg-slate-50/50 pb-32">
      {/* 1. Workstation Header */}
      <div className="bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute -top-10 -right-10 opacity-5">
          <Settings className="w-64 h-64 text-slate-900" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-[#66B21D] bg-green-50 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] h-7 flex items-center">
                ADMIN TERMINAL
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                #{service.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Edit <span className="text-[#66B21D]">Detail Pekerjaan</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                className="h-14 px-8 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 group"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Kembali
              </Button>
              <Button 
                onClick={handleGeneralSave} 
                disabled={busy} 
                className="h-14 px-12 rounded-2xl font-black bg-slate-900 hover:bg-black text-white shadow-xl transition-all active:scale-95 flex items-center gap-3 group"
              >
                {busy ? <Loader2 className="h-5 w-4 animate-spin text-[#66B21D]" /> : <Save className="h-5 w-5 text-[#66B21D]" />}
                Simpan & Update Audit
              </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Info Column */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-[40px] border border-slate-50 p-8 space-y-8 shadow-sm">
             {[
               { icon: User, label: "Pelanggan", value: service.customer?.name, color: "text-blue-500", bg: "bg-blue-50/50" },
               { icon: MapPin, label: "Lokasi", value: service.customer?.customerProfile?.alamat || "Jakarta Barat", color: "text-amber-500", bg: "bg-amber-50/50" },
               { icon: ClipboardList, label: "Keluhan", value: service.keluhan?.split("\n")[0] || "Tidak ada keluhan tertulis", color: "text-slate-400", bg: "bg-slate-50/50" }
             ].map((item, i) => (
                <div key={i} className={cn("rounded-[28px] p-5 border border-transparent flex items-center gap-5 transition-all group", item.bg)}>
                   <div className="size-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      <item.icon className={cn("size-6", item.color)} />
                   </div>
                   <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</span>
                      <span className="text-base font-black text-slate-900 truncate leading-tight">{item.value}</span>
                   </div>
                </div>
             ))}
           </div>

           {/* Grand Total Counter (Integrated Side) */}
           <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Settings className="w-32 h-32 rotate-12 group-hover:rotate-[30deg] transition-transform duration-700" />
              </div>
              <div className="relative z-10 space-y-8">
                 <div className="space-y-4">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Estimasi Tagihan</span>
                    <h2 className="text-5xl font-black tracking-tighter leading-none">Rp {grandTotal.toLocaleString("id-ID")}</h2>
                    <span className="text-[10px] font-bold text-[#66B21D] flex items-center gap-2 mt-2">
                       <Activity className="size-3.5" />
                       Real-time audit calculate active
                    </span>
                 </div>
                 <div className="h-px bg-white/10" />
                 <div className="space-y-6">
                    <div className="flex justify-between items-center opacity-60">
                       <span className="text-[10px] font-black uppercase tracking-widest">Pemeriksaan</span>
                       <span className="text-sm font-bold">Rp {biayaDasar.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-60">
                       <span className="text-[10px] font-black uppercase tracking-widest">Unit & Layanan</span>
                       <span className="text-sm font-bold">Rp {layananTotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#66B21D]">Material</span>
                       <span className="text-sm font-black text-[#66B21D]">Rp {materialTotal.toLocaleString("id-ID")}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Workstation Area */}
        <div className="lg:col-span-8 space-y-10">
           {/* Section 1: Admin Diagnostic Controls */}
           <div className="bg-white rounded-[40px] p-10 border border-slate-50 shadow-md space-y-10 relative overflow-hidden">
              <div className="flex items-center gap-3 pb-8 border-b border-slate-50">
                 <Settings className="size-5 text-[#66B21D]" />
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Main <span className="text-slate-400">Diagnostic Override</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                 {/* Status Field */}
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Update Status workflow</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-16 border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all font-black text-slate-900 focus:ring-4 focus:ring-green-100/50 px-6 text-sm">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-3xl border-slate-100 shadow-2xl p-2 min-w-[280px]">
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt} className="rounded-2xl px-5 py-4 text-xs font-black text-slate-700 data-[highlighted]:bg-green-50 data-[highlighted]:text-[#66B21D]">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>

                 {/* Technician Assign Field */}
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Assign Field Staff</Label>
                    <Select value={teknisiId} onValueChange={setTeknisiId}>
                      <SelectTrigger className="h-16 border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all font-black text-slate-900 focus:ring-4 focus:ring-blue-100/50 px-6 text-sm">
                        <SelectValue placeholder="Assign Teknisi" />
                      </SelectTrigger>
                      <SelectContent className="rounded-3xl border-slate-100 shadow-2xl p-2 min-w-[280px]">
                        <SelectItem value="none" className="rounded-2xl px-5 py-4 text-xs font-black text-slate-400 italic">Belum ditugaskan</SelectItem>
                        {technicians.map((t) => (
                          <SelectItem key={t.id} value={t.id} className="rounded-2xl px-5 py-4 text-xs font-black text-slate-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-600">
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
                            "w-full h-16 justify-start text-left font-black border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 text-slate-900 transition-all focus:ring-4 focus:ring-green-100/50 px-6 text-sm",
                            !date && "text-slate-400"
                          )}
                        >
                          <CalendarIcon className="mr-3 h-5 w-5 text-slate-400" />
                          {date ? format(date, "PPP") : <span>Set Schedule Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-slate-100 rounded-[32px] overflow-hidden shadow-2xl" align="end">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-4 bg-white" />
                      </PopoverContent>
                    </Popover>
                 </div>

                 {/* Jenis Servis Overload */}
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kategori Request</Label>
                    <Select value={jenisServis} onValueChange={setJenisServis}>
                      <SelectTrigger className="h-16 border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all font-black text-slate-900 focus:ring-4 focus:ring-green-100/50 px-6 text-sm">
                        <SelectValue placeholder="Jenis Layanan" />
                      </SelectTrigger>
                      <SelectContent className="rounded-3xl border-slate-100 shadow-2xl p-2 min-w-[280px]">
                        {JENIS_SERVIS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt} className="rounded-2xl px-5 py-4 text-xs font-black text-slate-700 data-[highlighted]:bg-green-50 data-[highlighted]:text-[#66B21D]">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
              </div>
           </div>

           {/* Section 2: Units & Services Management */}
           <div className="bg-white rounded-[40px] border border-slate-50 shadow-md overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Wind className="size-5 text-amber-500" />
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Manajemen Unit AC & Layanan</h2>
                 </div>
                 <div className="flex items-center gap-4">
                    <select 
                      className="h-10 w-24 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                      value={newUnitPk}
                      onChange={(e) => setNewUnitPk(e.target.value)}
                    >
                       <option value="0.5">0.5 PK</option>
                       <option value="1">1.0 PK</option>
                       <option value="1.5">1.5 PK</option>
                       <option value="2">2.0 PK</option>
                    </select>
                    <Button onClick={handleAddAcUnit} disabled={busy} className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest shadow-lg">
                      Tambah Unit
                    </Button>
                 </div>
              </div>

              <div className="p-0">
                 <table className="w-full">
                    <thead>
                       <tr className="bg-slate-50/20 border-b border-slate-50">
                          <th className="text-left py-4 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Detail Pekerjaan Unit</th>
                          <th className="text-right py-4 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest pr-20">Biaya</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {service.acUnits.map((unit: any, uIdx: number) => (
                          <tr key={unit.id} className="group hover:bg-slate-50/30 transition-colors">
                             <td className="py-8 px-8 space-y-6">
                                <div className="flex items-center gap-4">
                                   <div className="size-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-[11px] border border-amber-100">
                                      #{uIdx + 1}
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-sm font-black text-slate-900">Unit AC ({unit.pk} PK)</span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Kondisi Aktif</span>
                                   </div>
                                </div>

                                <div className="pl-14 space-y-4">
                                   {unit.layanan.map((l: any) => (
                                      <div key={l.id} className="flex items-center justify-between group/row p-3 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                         <div className="flex items-center gap-3">
                                            <div className="size-2 rounded-full bg-[#66B21D]" />
                                            <span className="text-xs font-black text-slate-700">{l.nama}</span>
                                         </div>
                                         <div className="flex items-center gap-6">
                                            <span className="text-xs font-bold text-slate-400 tracking-tight">Rp {l.harga.toLocaleString("id-ID")}</span>
                                            <button 
                                              onClick={() => adminRemoveUnitLayanan({ unitLayananId: l.id, serviceId: service.id })} 
                                              className="size-7 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-red-500 hover:text-white flex items-center justify-center"
                                            >
                                               <Trash2 className="size-3.5" />
                                            </button>
                                         </div>
                                      </div>
                                   ))}
                                   
                                   <div className="flex gap-2 pt-2">
                                      <select 
                                        className="h-10 flex-1 rounded-xl border border-slate-100 bg-slate-50/50 px-4 text-[10px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#66B21D]"
                                        value={selectedUnitId === unit.id ? selectedCatalogId : ""}
                                        onFocus={() => setSelectedUnitId(unit.id)}
                                        onChange={(e) => setSelectedCatalogId(e.target.value)}
                                      >
                                         <option value="">Tambah Layanan ke Unit #{uIdx + 1}...</option>
                                         {catalogRows
                                            .filter(r => r.pk === null || r.pk === String(unit.pk))
                                            .filter(r => !unit.layanan.find((ul: any) => ul.catalogId === r.uuid))
                                            .map(r => <option key={r.uuid} value={r.uuid}>{r.nama} (Rp {r.harga.toLocaleString("id-ID")})</option>)}
                                      </select>
                                      <Button 
                                        onClick={handleAddLayanan} 
                                        disabled={busy || selectedUnitId !== unit.id || !selectedCatalogId} 
                                        className="h-10 px-5 rounded-xl bg-[#66B21D] hover:bg-[#5aa11a] text-white font-black"
                                      >
                                         <Plus className="size-4" />
                                      </Button>
                                   </div>
                                </div>
                             </td>
                             <td className="py-8 px-8 text-right align-top pr-20">
                                <span className="text-sm font-black text-slate-900">Rp {unit.layanan.reduce((s: number, l: any) => s + l.harga, 0).toLocaleString("id-ID")}</span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Section 3: Materials Management */}
           <div className="bg-white rounded-[40px] border border-slate-50 shadow-md p-10 space-y-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                 <div className="flex items-center gap-3">
                    <Wrench className="size-5 text-blue-500" />
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Suku Cadang & Material Terpakai</h2>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Material Input Block */}
                 <div className="md:col-span-1 space-y-4">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Katalog Suku Cadang</Label>
                    <select 
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                    >
                       <option value="">Pilih Material...</option>
                       {inventoryItems.map(item => <option key={item.id} value={item.id}>{item.nama} (Stok: {item.qtyOnHand})</option>)}
                    </select>
                    <div className="flex gap-4">
                       <Input 
                         type="number" 
                         value={qty} 
                         onChange={(e) => setQty(e.target.value)} 
                         className="h-14 w-28 rounded-2xl border-slate-100 bg-slate-50/50 text-center font-black text-slate-900 shadow-inner" 
                         placeholder="Qty" 
                       />
                       <Button 
                         onClick={handleAddUsage} 
                         disabled={busy || !selectedItemId} 
                         className="h-14 flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                       >
                          <Plus className="size-5 mr-2" />
                          Tambah
                       </Button>
                    </div>
                 </div>

                 {/* Material List Table */}
                 <div className="md:col-span-1 lg:col-span-2 bg-slate-50/30 rounded-3xl border border-slate-50 overflow-hidden">
                    <table className="w-full text-xs">
                       <thead>
                          <tr className="bg-white/50 border-b border-slate-100">
                             <th className="py-4 px-6 text-left font-black text-slate-400 uppercase tracking-widest font-[8px]">Material Nama</th>
                             <th className="py-4 px-6 text-center font-black text-slate-400 uppercase tracking-widest font-[8px]">Qty</th>
                             <th className="py-4 px-6 text-right font-black text-slate-400 uppercase tracking-widest font-[8px]">Subtotal</th>
                             <th className="py-4 px-6"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100/50">
                          {service.materialUsages.map((mu: any) => (
                             <tr key={mu.id} className="group/item hover:bg-white/60 transition-colors">
                                <td className="py-4 px-6 font-black text-slate-700">{mu.item.nama}</td>
                                <td className="py-4 px-6 text-center font-bold text-slate-400">{mu.qty} {mu.item.uom}</td>
                                <td className="py-4 px-6 text-right font-black text-slate-900 leading-none">
                                   Rp {(mu.qty * mu.harga_satuan).toLocaleString("id-ID")}
                                </td>
                                <td className="py-4 px-6 text-right">
                                   <button 
                                      onClick={() => adminRemoveMaterialUsage({ usageId: mu.id, serviceId: service.id })}
                                      className="size-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center mx-auto opacity-0 group-hover/item:opacity-100"
                                    >
                                      <Trash2 className="size-4" />
                                   </button>
                                </td>
                             </tr>
                          ))}
                          {service.materialUsages.length === 0 && (
                             <tr><td colSpan={4} className="py-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Belum ada material terdaftar</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Persistent Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-[0_-12px_48px_rgba(0,0,0,0.05)] p-6 pl-8 lg:pl-72">
         <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <div className="hidden md:flex items-center gap-8">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Grand Total Billing</span>
                  <span className="text-2xl font-black text-slate-900">Rp {grandTotal.toLocaleString("id-ID")}</span>
               </div>
               <div className="h-10 w-px bg-slate-100" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#66B21D] uppercase tracking-widest tracking-tighter">Current Status</span>
                  <span className="text-sm font-black text-slate-400 uppercase tracking-tight">{status}</span>
               </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
               <Button 
                 variant="ghost" 
                 onClick={() => router.back()} 
                 className="h-14 px-8 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
               >
                 Cancel Changes
               </Button>
               <Button 
                onClick={handleGeneralSave} 
                disabled={busy} 
                className="h-14 flex-1 md:flex-none px-12 rounded-2xl font-black bg-[#66B21D] hover:bg-[#5aa11a] text-white shadow-2xl shadow-green-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                <span className="uppercase tracking-widest text-xs">Simpan Perubahan</span>
              </Button>
            </div>
         </div>
      </div>
    </div>
  )
}
