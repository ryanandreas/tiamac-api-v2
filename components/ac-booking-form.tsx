"use client"

import * as React from "react"
import { useActionState } from "react"
import { createAcBooking } from "@/app/actions/booking"
import type { CreateBookingState } from "@/app/actions/booking"
import type { CurrentUser } from "@/app/actions/session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableFooter, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"

const BASE_VISIT_FEE = 50000

type CatalogRow = { nama: string; pk: string | null; harga: number }
type CatalogIndex = Record<string, { defaultPrice?: number; priceByPk: Record<string, number> }>

type UnitState = { pk?: number; layanan: string[] }

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

function pkLabel(pk: number) {
  if (pk === 0.5) return "1/2 PK"
  return `${pk} PK`
}

function calcUnitTotal(unit: UnitState, catalog: CatalogIndex) {
  const pk = unit.pk ? String(unit.pk) : undefined
  return unit.layanan.reduce((sum, layananName) => {
    const item = catalog[layananName]
    if (!item) return sum
    const price = (pk ? item.priceByPk[pk] : undefined) ?? item.defaultPrice ?? 0
    return sum + price
  }, 0)
}

export function AcBookingForm({
  catalogRows,
  currentUser,
}: {
  catalogRows: CatalogRow[]
  currentUser?: CurrentUser
}) {
  const formId = "ac-booking-form"
  const [state, formAction, isPending] = useActionState<CreateBookingState, FormData>(
    createAcBooking,
    null
  )

  const formRef = React.useRef<HTMLFormElement | null>(null)

  const selectClassName =
    "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-none"

  const [units, setUnits] = React.useState<UnitState[]>([{ pk: undefined, layanan: [] }])
  const [coords, setCoords] = React.useState<{ lat?: number; lng?: number }>({})
  const [geoError, setGeoError] = React.useState<string | null>(null)
  const [clientMessage, setClientMessage] = React.useState<string | null>(null)
  const [editingUnitIndex, setEditingUnitIndex] = React.useState<number | null>(null)
  const [showError, setShowError] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const [confirmSnapshot, setConfirmSnapshot] = React.useState<{
    pemesanNama?: string
    pemesanEmail?: string
    pemesanNoTelp?: string
    keluhan: string
    alamat: string
    jadwalTanggal: string
  } | null>(null)

  // Auto-close confirmation dialog and handle floating error timing
  React.useEffect(() => {
    if (state && !state.success) {
      setConfirmOpen(false)
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [state])

  // Handle clientMessage error timing
  React.useEffect(() => {
    if (clientMessage) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [clientMessage])

  const detectLocation = React.useCallback(() => {
    setGeoError(null)
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation tidak tersedia di browser ini.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        setGeoError("Gagal mendeteksi lokasi. Pastikan izin lokasi diaktifkan.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const mapsHref =
    coords.lat !== undefined && coords.lng !== undefined
      ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
      : "https://www.google.com/maps"

  const catalog = React.useMemo<CatalogIndex>(() => {
    const idx: CatalogIndex = {}
    for (const row of catalogRows) {
      if (!idx[row.nama]) idx[row.nama] = { priceByPk: {} }
      if (row.pk) idx[row.nama].priceByPk[row.pk] = row.harga
      else idx[row.nama].defaultPrice = row.harga
    }
    return idx
  }, [catalogRows])

  const layananList = React.useMemo(() => Object.keys(catalog).sort(), [catalog])

  const pkOptions = React.useMemo(() => {
    const pkSet = new Set<number>()
    for (const row of catalogRows) {
      if (!row.pk) continue
      const n = Number(row.pk)
      if (Number.isFinite(n)) pkSet.add(n)
    }
    const values = Array.from(pkSet).sort((a, b) => a - b)
    if (values.length === 0) return [0.5, 1, 1.5, 2]
    return values
  }, [catalogRows])

  const unitsJson = React.useMemo(() => JSON.stringify(units.map((u) => ({ pk: u.pk, layanan: u.layanan }))), [units])
  const layananTotal = React.useMemo(() => units.reduce((sum, unit) => sum + calcUnitTotal(unit, catalog), 0), [units, catalog])
  const totalEstimasi = Math.max(layananTotal, BASE_VISIT_FEE)
  const isMinimumFee = layananTotal < BASE_VISIT_FEE
  const selectedLayananNames = React.useMemo(
    () => Array.from(new Set(units.flatMap((u) => u.layanan))).filter(Boolean),
    [units]
  )
  const receiptRows = React.useMemo(() => {
    const rows: Array<{ id: string; deskripsi: string; pk: string; harga: number }> = []

    if (isMinimumFee) {
      rows.push({
        id: "minimum-fee",
        deskripsi: "Minimum Biaya Kunjungan/Servis",
        pk: "-",
        harga: BASE_VISIT_FEE,
      })
    }

    units.forEach((unit, index) => {
      if (!unit.pk) return
      const pkKey = String(unit.pk)
      const pkText = pkLabel(unit.pk)
      unit.layanan.forEach((name) => {
        const item = catalog[name]
        const price = (item?.priceByPk[pkKey] ?? item?.defaultPrice ?? 0) as number
        rows.push({
          id: `ac-${index}-${name}`,
          deskripsi: `AC ${index + 1} - ${name}`,
          pk: pkText,
          harga: price,
        })
      })
    })

    return rows
  }, [catalog, units])

  const requireGuestIdentity = !currentUser?.isAuthenticated || currentUser.type !== "customer"

  const openConfirm = React.useCallback(() => {
    setClientMessage(null)

    const form = formRef.current
    if (!form) return
    if (!form.reportValidity()) return

    const hasPk = units.some((u) => typeof u.pk === "number" && Number.isFinite(u.pk) && (u.pk as number) > 0)
    if (!hasPk) {
      setClientMessage("Pilih PK untuk minimal 1 AC.")
      return
    }
    if (selectedLayananNames.length === 0) {
      setClientMessage("Pilih minimal 1 layanan servis.")
      return
    }

    const fd = new FormData(form)
    const pemesanNama = (String(fd.get("pemesan_nama") ?? "").trim()) || (currentUser as any)?.name
    const pemesanEmail = (String(fd.get("pemesan_email") ?? "").trim()) || (currentUser as any)?.email
    const pemesanNoTelp = (String(fd.get("pemesan_no_telp") ?? "").trim()) || (currentUser as any)?.profile?.no_telp
    const keluhan = String(fd.get("keluhan") ?? "").trim()
    const alamat = String(fd.get("alamat") ?? "").trim()
    const jadwalTanggal = String(fd.get("jadwal_tanggal") ?? "").trim()

    setConfirmSnapshot({
      pemesanNama: pemesanNama || undefined,
      pemesanEmail: pemesanEmail || undefined,
      pemesanNoTelp: pemesanNoTelp || undefined,
      keluhan,
      alamat,
      jadwalTanggal,
    })
    setConfirmOpen(true)
  }, [selectedLayananNames.length, units])

  return (
    <div className="min-h-screen bg-[#F8FAFC]/50 pb-20">
      {/* Header Spacer or Nav would be above this in the layout.ts / page.tsx */}
      
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 pt-12">
        <div className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#66B21D]/5 border border-[#66B21D]/10 text-[#66B21D] text-xs font-bold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-[#66B21D] animate-pulse" />
            Service Verified
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Pesan Servis Teknisi <br className="hidden lg:block" /> ke Lokasi Anda
          </h1>
          
          {(state?.message || clientMessage) && showError && (
            <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4 animate-in fade-in slide-in-from-top-8 duration-500">
              <div className="p-6 rounded-[28px] bg-white border border-rose-100 flex items-center gap-5 shadow-2xl shadow-rose-200/40 ring-4 ring-rose-50/50">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <div className="text-left flex-1">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1.5">Terjadi Kesalahan</p>
                  <p className="text-sm font-bold text-slate-900 leading-tight uppercase tracking-tight">{state?.message || clientMessage}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowError(false)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-300 hover:text-slate-500"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <form id={formId} ref={formRef} action={formAction}>
          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Form Steps (8/12) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Step 01: Identitas */}
              <Card className="rounded-[32px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#66B21D] flex items-center justify-center text-white font-black text-sm">
                      01
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-wide">Identitas Pemesan</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  {requireGuestIdentity ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="pemesan_nama" className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Nama Lengkap</Label>
                        <Input id="pemesan_nama" name="pemesan_nama" placeholder="Isi nama lengkap Anda" className="bg-slate-50 border-none rounded-2xl h-14 px-5 focus-visible:ring-[#66B21D] shadow-none transition-all" required defaultValue={(currentUser as any)?.name || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pemesan_no_telp" className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Nomor Whatsapp</Label>
                        <Input id="pemesan_no_telp" name="pemesan_no_telp" type="tel" placeholder="08xx (Nomor WhatsApp Aktif)" className="bg-slate-50 border-none rounded-2xl h-14 px-5 focus-visible:ring-[#66B21D] shadow-none transition-all" required />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="pemesan_email" className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Aktif</Label>
                        <Input id="pemesan_email" name="pemesan_email" type="email" placeholder="Masukkan alamat email aktif" className="bg-slate-50 border-none rounded-2xl h-14 px-5 focus-visible:ring-[#66B21D] shadow-none transition-all" required defaultValue={(currentUser as any)?.email || ""} />
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#66B21D]/10 flex items-center justify-center text-[#66B21D] font-bold text-lg">
                          {currentUser?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{currentUser?.name}</p>
                          <p className="text-xs font-bold text-slate-500">{currentUser?.email}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-[#66B21D] text-white text-[10px] font-black uppercase tracking-widest">Logged In</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 02: Keluhan & Lokasi */}
              <Card className="rounded-[32px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#66B21D] flex items-center justify-center text-white font-black text-sm">
                      02
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-wide">Keluhan & Lokasi</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-8">
                  {/* Address Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 px-1">
                      <Label htmlFor="alamat" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Alamat Pengerjaan</Label>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" className="h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-none border-none" onClick={detectLocation}>
                          Auto-detect
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-none border-none" asChild>
                          <a href={mapsHref} target="_blank" rel="noreferrer">Set Map</a>
                        </Button>
                      </div>
                    </div>
                    {geoError && <div className="text-[10px] font-bold text-rose-500 px-1 uppercase tracking-widest">{geoError}</div>}
                    <Textarea id="alamat" name="alamat" placeholder="Ketik alamat lengkap (Detail: No. Rumah, Blok, RT/RW)..." className="bg-slate-50 border-none rounded-2xl p-5 focus-visible:ring-[#66B21D] shadow-none transition-all resize-none min-h-[120px]" required />
                  </div>

                  {/* Problem Description */}
                  <div className="space-y-4">
                    <Label htmlFor="keluhan" className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Deskripsi Masalah</Label>
                    <Textarea id="keluhan" name="keluhan" placeholder="Jelaskan masalah AC Anda (misal: AC tidak dingin, berisik, atau ada bocor air)..." className="bg-slate-50 border-none rounded-2xl p-5 focus-visible:ring-[#66B21D] shadow-none transition-all resize-none min-h-[120px]" required />
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-4">
                    <Label htmlFor="jadwal_tanggal" className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Hari Kedatangan</Label>
                    <div className="relative">
                      <Input 
                        id="jadwal_tanggal" 
                        name="jadwal_tanggal" 
                        type="text" 
                        placeholder="Pilih Tanggal Kunjungan"
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => { if (!e.target.value) e.target.type = "text" }}
                        className="bg-slate-50 border-none rounded-2xl h-14 px-5 focus-visible:ring-[#66B21D] shadow-none transition-all font-bold appearance-none uppercase text-[10px] tracking-widest placeholder:text-slate-400" 
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 03: Konfigurasi Unit */}
              <Card className="rounded-[32px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-[#66B21D] flex items-center justify-center text-white font-black text-sm">
                        03
                      </div>
                      <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-wide">Konfigurasi Unit</CardTitle>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="bg-[#66B21D]/5 hover:bg-[#66B21D]/10 text-[#66B21D] rounded-xl px-4 h-10 text-[10px] font-black uppercase tracking-widest transition-all"
                      onClick={() => setUnits((prev) => [...prev, { pk: undefined, layanan: [] }])}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Tambah Unit AC
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  <input type="hidden" name="units_json" value={unitsJson} />
                  
                  {units.map((unit, index) => {
                    const pk = unit.pk ? String(unit.pk) : undefined
                    const unitTotal = calcUnitTotal(unit, catalog)
                    const hasServices = unit.layanan.length > 0
                    
                    return (
                      <Dialog 
                        key={index} 
                        open={editingUnitIndex === index} 
                        onOpenChange={(open) => setEditingUnitIndex(open ? index : null)}
                      >
                        <div className="group relative rounded-[24px] border border-slate-100 bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/40">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-black shadow-sm group-hover:border-[#66B21D]/20 group-hover:text-[#66B21D] transition-all">
                                {index + 1}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${unit.pk ? "bg-[#66B21D]/10 text-[#66B21D]" : "bg-slate-200 text-slate-500"}`}>
                                    {unit.pk ? "Ready for Service" : "Konfigurasi Belum Lengkap"}
                                  </div>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 group-hover:text-[#66B21D] transition-colors">
                                  Unit #{index + 1} — {unit.pk ? pkLabel(unit.pk) : "Belum Pilih PK"}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {hasServices ? `Layanan: ${unit.layanan.join(" + ")}` : "Pilih layanan di detail unit"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimasi Unit</p>
                                <p className="text-lg font-black text-slate-900">{formatRupiah(unitTotal)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <DialogTrigger asChild>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-xl h-10 border-slate-200 bg-white shadow-none font-bold text-[10px] uppercase tracking-widest hover:border-[#66B21D] hover:text-[#66B21D] transition-all"
                                    onClick={() => setEditingUnitIndex(index)}
                                  >
                                    Edit Detail
                                  </Button>
                                </DialogTrigger>
                                {units.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-xl h-10 bg-rose-50 text-rose-500 hover:bg-rose-100 font-bold text-[10px] uppercase tracking-widest shadow-none"
                                    onClick={() => setUnits((prev) => prev.filter((_, i) => i !== index))}
                                  >
                                    Hapus
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
                          <DialogHeader className="bg-slate-900 p-8 text-white">
                            <DialogTitle className="text-2xl font-black uppercase tracking-wider">Konfigurasi AC #{index + 1}</DialogTitle>
                            <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest pt-1">
                              Sesuaikan PK dan Layanan untuk Unit ini
                            </DialogDescription>
                          </DialogHeader>

                          <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto">
                            {/* PK Options */}
                            <div className="space-y-4">
                              <Label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1">Pilih PK AC</Label>
                              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {pkOptions.map((value) => {
                                  const selected = unit.pk === value
                                  return (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() =>
                                        setUnits((prev) =>
                                          prev.map((u, i) => (i === index ? { ...u, pk: value, layanan: u.layanan } : u))
                                        )
                                      }
                                      className={`rounded-2xl border-2 p-5 text-left transition-all relative overflow-hidden ${
                                        selected 
                                          ? "border-[#66B21D] bg-[#66B21D]/5" 
                                          : "border-slate-100 hover:border-slate-200 bg-white"
                                      }`}
                                    >
                                      {selected && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#66B21D]" />}
                                      <div className={`text-lg font-black ${selected ? "text-[#66B21D]" : "text-slate-900"}`}>
                                        {pkLabel(value)}
                                      </div>
                                      <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${selected ? "text-[#66B21D]/60" : "text-slate-400"}`}>
                                        Pilih PK
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Service Selection */}
                            <div className="space-y-4">
                              <Label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1">Layanan Servis</Label>
                              {unit.pk ? (
                                <div className="space-y-4">
                                  {Array.from({ length: unit.layanan.length < layananList.length ? unit.layanan.length + 1 : unit.layanan.length }, (_, LIdx) => LIdx).map((LIdx) => {
                                    const value = unit.layanan[LIdx] ?? ""
                                    const optionList = layananList.filter((name) => name === value || !unit.layanan.includes(name))
                                    const item = value ? catalog[value] : undefined
                                    const price = value && item ? (pk ? item.priceByPk[pk] : undefined) ?? item.defaultPrice ?? 0 : 0
                                    
                                    return (
                                      <div key={`${index}-${LIdx}`} className="bg-slate-50 border border-slate-100 rounded-[20px] p-4 flex flex-col md:flex-row gap-4 items-center">
                                        <select
                                          className="flex-1 w-full bg-white border-none rounded-xl h-12 px-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#66B21D] transition-all outline-none appearance-none"
                                          value={value}
                                          onChange={(e) => {
                                            const nVal = e.target.value
                                            if(!nVal) return
                                            setUnits(prev => prev.map((u, i) => {
                                              if(i !== index) return u
                                              const next = [...u.layanan]
                                              if(LIdx < next.length) next[LIdx] = nVal
                                              else next.push(nVal)
                                              return { ...u, layanan: Array.from(new Set(next)) }
                                            }))
                                          }}
                                        >
                                          <option value="" disabled>Pilih Layanan...</option>
                                          {optionList.map(name => <option key={name} value={name}>{name}</option>)}
                                        </select>
                                        
                                        {value && (
                                          <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className="text-right flex-1">
                                              <p className="text-[10px] font-black text-slate-400 capitalize mb-0.5 whitespace-nowrap">Harga Estimasi</p>
                                              <p className="font-black text-slate-900">{formatRupiah(price)}</p>
                                            </div>
                                            <Button type="button" variant="ghost" className="h-10 w-10 p-0 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all" onClick={() => {
                                              setUnits(prev => prev.map((u, i) => {
                                                if(i !== index) return u
                                                return { ...u, layanan: u.layanan.filter((_, idx) => idx !== LIdx) }
                                              }))
                                            }}>
                                              <Plus className="rotate-45 h-5 w-5" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="p-8 rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 text-center">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pilih PK AC Terlebih Dahulu</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
                             <Button 
                               type="button" 
                               className="bg-[#66B21D] hover:bg-[#66B21D]/90 text-white rounded-xl px-10 h-12 font-black uppercase tracking-widest shadow-lg shadow-[#66B21D]/20 transition-all"
                               onClick={() => setEditingUnitIndex(null)}
                             >
                               Simpan Detail unit
                             </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )
                  })}
                </CardContent>
              </Card>

            </div>

            {/* Right Column: Sticky Sidebar (4/12) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 pb-20">
              
              {/* Cost Summary Card */}
              <Card className="rounded-[32px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Rincian Estimasi</h3>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-8">
                  <div className="space-y-6">
                    {/* Primary Breakdown Rows */}
                    <div className="space-y-4 px-2">
                       <div className="flex justify-between items-center transition-all">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Biaya Kunjungan</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Booking & Diagnosa</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">{formatRupiah(BASE_VISIT_FEE)}</span>
                       </div>

                       <div className="flex justify-between items-center transition-all">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-[#66B21D] uppercase tracking-widest mb-1">Total Sisa Pelunasan</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Bayar ke Teknisi</span>
                          </div>
                          <span className="text-lg font-black text-[#66B21D]">{formatRupiah(totalEstimasi - BASE_VISIT_FEE)}</span>
                       </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    {/* Grand Total Black Card */}
                    <div className="px-8 py-8 rounded-[32px] bg-slate-900 text-white shadow-2xl shadow-slate-900/20 flex flex-col gap-2 ring-2 ring-slate-800 transition-all hover:scale-[1.01]">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-[#66B21D] uppercase tracking-[0.3em] mb-1">Total Biaya Servis</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Estimasi Keseluruhan</span>
                      </div>
                      <span className="text-4xl font-black text-white tracking-tighter">{formatRupiah(totalEstimasi)}</span>
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <div className="flex items-start gap-4 p-5 rounded-3xl border border-slate-100 bg-slate-50/50 transition-all hover:bg-slate-50 group/agree">
                    <div className="pt-0.5">
                      <Checkbox
                        id="agree_biaya_kunjungan_sidebar"
                        name="agree_biaya_kunjungan"
                        className="h-5 w-5 rounded-md border-2 border-slate-200 data-[state=checked]:bg-[#66B21D] data-[state=checked]:border-[#66B21D] transition-all bg-white shadow-none"
                        required
                      />
                    </div>
                    <Label 
                      htmlFor="agree_biaya_kunjungan_sidebar" 
                      className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider cursor-pointer group-hover/agree:text-slate-700 transition-colors"
                    >
                      SAYA SETUJU UNTUK MEMBAYAR BIAYA KUNJUNGAN TERLEBIH DAHULU
                    </Label>
                  </div>

                  {/* Primary CTA */}
                  <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <Button 
                      type="button" 
                      disabled={isPending} 
                      onClick={openConfirm}
                      className="w-full h-16 rounded-[24px] bg-[#66B21D] hover:bg-[#66B21D]/90 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-[#66B21D]/20 transition-all hover:scale-[1.02] active:scale-[0.98] group gap-3"
                    >
                      {isPending ? "Memproses..." : "Pesan Sekarang"}
                      {!isPending && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
                    </Button>

                    {/* Notification Message */}

                    <DialogContent className="sm:max-w-5xl p-0 overflow-hidden border-none rounded-[40px] shadow-2xl">
                      <DialogHeader className="bg-slate-900 p-10 text-white text-center">
                        <DialogTitle className="text-3xl font-black uppercase tracking-[0.2em]">Nota Konfirmasi</DialogTitle>
                        <DialogDescription className="text-slate-400 font-bold uppercase text-xs tracking-widest pt-2">
                          Periksa kembali rincian servis sebelum konfirmasi
                        </DialogDescription>
                      </DialogHeader>

                      <div className="p-8 lg:p-12 space-y-10 max-h-[70vh] overflow-y-auto bg-white">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          {/* Info Column */}
                          <div className="space-y-8">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-[#66B21D]/10 flex items-center justify-center text-[#66B21D]">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Data Pemesan</h4>
                              </div>
                              <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-100/50 pb-3">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama</span>
                                  <span className="text-sm font-black text-slate-900">{confirmSnapshot?.pemesanNama || "-"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100/50 pb-3">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Whatsapp</span>
                                  <span className="text-sm font-black text-slate-900">{confirmSnapshot?.pemesanNoTelp || "-"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</span>
                                  <span className="text-sm font-black text-slate-900">{confirmSnapshot?.pemesanEmail || "-"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-[#66B21D]/10 flex items-center justify-center text-[#66B21D]">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                </div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Jadwal & Lokasi</h4>
                              </div>
                              <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 space-y-6">
                                <div className="flex justify-between items-center border-b border-slate-100/50 pb-4">
                                  <div className="flex items-center gap-2">
                                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hari Kedatangan</span>
                                  </div>
                                  <span className="text-sm font-black text-slate-900">{confirmSnapshot?.jadwalTanggal || "-"}</span>
                                </div>
                                <div className="space-y-3">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alamat Pengerjaan</span>
                                  <p className="text-xs font-bold text-slate-900 leading-relaxed bg-white/50 p-4 rounded-2xl border border-slate-100/50">{confirmSnapshot?.alamat || "-"}</p>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deskripsi Masalah</span>
                                  </div>
                                  <p className="text-xs font-bold text-slate-900 leading-relaxed bg-rose-50/30 p-4 rounded-2xl border border-rose-100/30 italic">"{confirmSnapshot?.keluhan || "-"}"</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Billing Column */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                               <div className="w-6 h-6 rounded-lg bg-[#66B21D]/10 flex items-center justify-center text-[#66B21D]">
                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                               </div>
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Rincian Layanan</h4>
                            </div>
                            <div className="border border-slate-100 rounded-[32px] overflow-hidden">
                              <Table>
                                <TableHeader className="bg-slate-50">
                                  <TableRow className="border-slate-100 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-12">Layanan</TableHead>
                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 h-12 text-right">Harga</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {receiptRows.map((row) => (
                                    <TableRow key={row.id} className="border-slate-100 hover:bg-transparent">
                                      <TableCell className="px-6 py-4">
                                        <div className="text-xs font-bold text-slate-900">{row.deskripsi}</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PK: {row.pk}</div>
                                      </TableCell>
                                      <TableCell className="px-6 py-4 text-right text-xs font-black text-slate-900">{formatRupiah(row.harga)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                                <TableFooter className="bg-slate-950">
                                  <TableRow className="hover:bg-transparent border-none">
                                    <TableCell className="px-6 h-12 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Biaya Kunjungan</TableCell>
                                    <TableCell className="px-6 h-12 text-right text-sm font-black text-slate-500">{formatRupiah(BASE_VISIT_FEE)}</TableCell>
                                  </TableRow>
                                  <TableRow className="hover:bg-transparent border-none">
                                    <TableCell className="px-6 h-12 text-[10px] font-bold text-[#66B21D] uppercase tracking-widest">Total Sisa Pelunasan</TableCell>
                                    <TableCell className="px-6 h-12 text-right text-sm font-black text-[#66B21D]">{formatRupiah(totalEstimasi - BASE_VISIT_FEE)}</TableCell>
                                  </TableRow>
                                  <TableRow className="hover:bg-transparent border-none">
                                    <TableCell className="px-6 h-18 text-xs font-black text-white uppercase tracking-widest border-t border-slate-800">Total Biaya Servis</TableCell>
                                    <TableCell className="px-6 h-18 text-right text-3xl font-black text-white border-t border-slate-800">{formatRupiah(totalEstimasi)}</TableCell>
                                  </TableRow>
                                </TableFooter>
                              </Table>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-10 flex flex-col-reverse sm:flex-row justify-end gap-4 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)} disabled={isPending} className="rounded-2xl h-14 px-10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all">
                          Cancel
                        </Button>
                        <Button type="submit" form={formId} disabled={isPending} className="rounded-2xl h-14 px-12 bg-[#66B21D] hover:bg-[#66B21D]/90 text-white font-black uppercase tracking-widest shadow-xl shadow-[#66B21D]/20 transition-all">
                          {isPending ? "Confirming..." : "Konfirmasi & Order"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="flex justify-center gap-8 pt-4">
                     <div className="flex items-center gap-2 text-slate-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Secure</span>
                     </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </form>
      </div>
    </div>
  )

}
