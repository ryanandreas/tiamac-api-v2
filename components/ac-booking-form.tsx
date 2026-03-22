"use client"

import * as React from "react"
import { useActionState } from "react"
import { createAcBooking } from "@/app/actions/booking"
import type { CreateBookingState } from "@/app/actions/booking"
import type { CurrentUser } from "@/app/actions/session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmSnapshot, setConfirmSnapshot] = React.useState<{
    pemesanNama?: string
    pemesanEmail?: string
    pemesanNoTelp?: string
    keluhan: string
    alamat: string
    jadwalTanggal: string
  } | null>(null)

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
  const totalEstimasi = BASE_VISIT_FEE + layananTotal
  const selectedLayananNames = React.useMemo(
    () => Array.from(new Set(units.flatMap((u) => u.layanan))).filter(Boolean),
    [units]
  )
  const receiptRows = React.useMemo(() => {
    const rows: Array<{ id: string; deskripsi: string; pk: string; harga: number }> = [
      {
        id: "visit-fee",
        deskripsi: "Biaya kunjungan & diagnosa",
        pk: "-",
        harga: BASE_VISIT_FEE,
      },
    ]

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
    const pemesanNama = String(fd.get("pemesan_nama") ?? "").trim()
    const pemesanEmail = String(fd.get("pemesan_email") ?? "").trim()
    const pemesanNoTelp = String(fd.get("pemesan_no_telp") ?? "").trim()
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pesan Servis Teknisi ke Lokasi Anda</h1>
        <p className="text-muted-foreground text-sm">Khusus untuk servis AC.</p>
      </div>

      <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estimasi Biaya Dasar</CardTitle>
          <CardDescription>Biaya kunjungan & diagnosa (wajib jelas).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border bg-background px-4 py-3 shadow-none">
            <div>
              <div className="font-semibold">Biaya Kunjungan & Diagnosa</div>
              <div className="text-xs text-muted-foreground">
                Biaya ini tetap dibayar jika perbaikan tidak dilanjutkan.
              </div>
            </div>
            <div className="text-lg font-bold">Rp 50.000</div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Total Estimasi</CardTitle>
          <CardDescription>Biaya kunjungan + layanan yang Anda pilih.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border bg-background px-4 py-3 shadow-none">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-lg font-bold">{formatRupiah(totalEstimasi)}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-none">
        <CardHeader>
          <CardTitle>Form Booking</CardTitle>
          <CardDescription>Isi detail servis AC dan jadwal kedatangan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id={formId} ref={formRef} action={formAction} className="space-y-5">
            {state?.message ? (
              <div className="text-sm font-medium text-destructive">{state.message}</div>
            ) : null}
            {clientMessage ? <div className="text-sm font-medium text-destructive">{clientMessage}</div> : null}

            {requireGuestIdentity ? (
              <div className="rounded-lg border bg-background p-4">
                <div className="text-sm font-medium">Data Pemesan</div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pemesan_nama">Nama</Label>
                    <Input id="pemesan_nama" name="pemesan_nama" className="bg-white rounded-xl shadow-none" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pemesan_no_telp">Nomor HP</Label>
                    <Input id="pemesan_no_telp" name="pemesan_no_telp" type="tel" className="bg-white rounded-xl shadow-none" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="pemesan_email">Email</Label>
                    <Input id="pemesan_email" name="pemesan_email" type="email" className="bg-white rounded-xl shadow-none" required />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="keluhan">Keluhan / Deskripsi Masalah</Label>
              <Textarea
                id="keluhan"
                name="keluhan"
                placeholder="AC tidak dingin & berisik"
                rows={4}
                className="bg-white rounded-xl shadow-none"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Alamat & Map Picker</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" className="rounded-xl shadow-none" onClick={detectLocation}>
                    Auto-detect lokasi
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-xl shadow-none" asChild>
                    <a href={mapsHref} target="_blank" rel="noreferrer">
                      Pin titik rumah
                    </a>
                  </Button>
                </div>
              </div>
              {geoError ? <div className="text-xs text-destructive">{geoError}</div> : null}
              <Textarea id="alamat" name="alamat" placeholder="Alamat lengkap lokasi Anda" className="bg-white rounded-xl shadow-none" rows={3} required />
              <div className="text-xs text-muted-foreground">
                Gunakan auto-detect lalu pin lokasi Anda di peta.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jadwal_tanggal">Pilih Hari Kedatangan</Label>
                <Input id="jadwal_tanggal" name="jadwal_tanggal" type="date" className="bg-white rounded-xl shadow-none" required />
              </div>
            </div>

            <div className="space-y-5">
              <input type="hidden" name="units_json" value={unitsJson} />

              {layananList.length === 0 ? (
                <div className="rounded-xl border bg-background p-3 text-sm text-muted-foreground">
                  Katalog layanan belum tersedia.
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Pilih Jenis AC</div>
                  <div className="text-xs text-muted-foreground">Tambahkan AC jika lebih dari 1 unit.</div>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  className="rounded-full transition-all shadow-none"
                  onClick={() => setUnits((prev) => [...prev, { pk: undefined, layanan: [] }])}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {units.map((unit, index) => {
                  const pk = unit.pk ? String(unit.pk) : undefined
                  const unitTotal = calcUnitTotal(unit, catalog)
                  return (
                    <Dialog key={index}>
                      <Card className="border-muted bg-background rounded-xl shadow-none">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-base">AC {index + 1}</CardTitle>
                            <div className="flex items-center gap-2">
                              <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="sm" className="rounded-xl shadow-none">
                                  Buka Form
                                </Button>
                              </DialogTrigger>
                              {units.length > 1 ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl text-destructive hover:bg-destructive/5 shadow-none"
                                  onClick={() => setUnits((prev) => prev.filter((_, i) => i !== index))}
                                >
                                  Hapus
                                </Button>
                              ) : null}
                            </div>
                          </div>
                          <CardDescription>
                            Estimasi layanan unit ini: {formatRupiah(unitTotal)}
                          </CardDescription>
                        </CardHeader>
                      </Card>

                      <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>AC {index + 1}</DialogTitle>
                          <DialogDescription>Estimasi layanan unit ini: {formatRupiah(unitTotal)}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Pilih PK AC</Label>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
                                    className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                                      selected ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                                    }`}
                                  >
                                    <div className="font-semibold">{pkLabel(value)}</div>
                                    <div className="text-xs text-muted-foreground">Pilih PK</div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Pilih Layanan Servis</Label>
                            {unit.pk ? (
                              <div className="space-y-3">
                                {Array.from(
                                  {
                                    length:
                                      unit.layanan.length < layananList.length
                                        ? unit.layanan.length + 1
                                        : unit.layanan.length,
                                  },
                                  (_, layananIndex) => layananIndex
                                ).map((layananIndex) => {
                                  const value = unit.layanan[layananIndex] ?? ""
                                  const optionList = layananList.filter(
                                    (name) => name === value || !unit.layanan.includes(name)
                                  )
                                  const item = value ? catalog[value] : undefined
                                  const price =
                                    value && item
                                      ? (pk ? item.priceByPk[pk] : undefined) ?? item.defaultPrice ?? 0
                                      : 0
                                  const priceLabel =
                                    value && item
                                      ? item.defaultPrice !== undefined && Object.keys(item.priceByPk).length === 0
                                        ? "Harga tetap"
                                        : "Harga sesuai PK"
                                      : null

                                  return (
                                    <div
                                      key={`${index}-${layananIndex}`}
                                      className="rounded-lg border bg-background p-3"
                                    >
                                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div className="flex w-full items-center gap-2">
                                          <select
                                            className={selectClassName}
                                            value={value}
                                            onChange={(event) => {
                                              const nextValue = event.target.value
                                              if (!nextValue) return
                                              setUnits((prev) =>
                                                prev.map((u, i) => {
                                                  if (i !== index) return u
                                                  const next = [...u.layanan]
                                                  if (layananIndex < next.length) next[layananIndex] = nextValue
                                                  else next.push(nextValue)
                                                  const unique = Array.from(new Set(next))
                                                  return { ...u, layanan: unique }
                                                })
                                              )
                                            }}
                                          >
                                            <option value="" disabled>
                                              Pilih layanan servis
                                            </option>
                                            {optionList.map((name) => (
                                              <option key={name} value={name}>
                                                {name}
                                              </option>
                                            ))}
                                          </select>
                                          {value ? (
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              className="rounded-xl shadow-none"
                                              onClick={() =>
                                                setUnits((prev) =>
                                                  prev.map((u, i) => {
                                                    if (i !== index) return u
                                                    return {
                                                      ...u,
                                                      layanan: u.layanan.filter((_, idx) => idx !== layananIndex),
                                                    }
                                                  })
                                                )
                                              }
                                            >
                                              Hapus
                                            </Button>
                                          ) : null}
                                        </div>

                                        {value ? (
                                          <div className="flex items-center justify-between gap-3 md:justify-end">
                                            {priceLabel ? (
                                              <div className="text-xs text-muted-foreground">{priceLabel}</div>
                                            ) : null}
                                            <div className="font-semibold">{formatRupiah(price)}</div>
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                  )
                                })}

                                <div className="text-xs text-muted-foreground">
                                  Setelah memilih 1 layanan, dropdown tambahan akan muncul untuk menambah layanan servis
                                  baru.
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                                Pilih PK AC terlebih dahulu untuk menampilkan layanan.
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border bg-background p-3">
              <Checkbox
                id="agree_biaya_kunjungan"
                name="agree_biaya_kunjungan"
                className="bg-white shadow-none"
                required
              />
              <Label htmlFor="agree_biaya_kunjungan" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Saya menyetujui biaya kunjungan
              </Label>
            </div>

            <div className="flex justify-end">
              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <Button type="button" disabled={isPending} onClick={openConfirm} className="rounded-xl px-12 h-12 text-base font-semibold shadow-none">
                  {isPending ? "Memproses..." : "Booking Sekarang"}
                </Button>
                <DialogContent className="sm:max-w-4xl">
                  <DialogHeader className="text-center">
                    <DialogTitle>NOTA KONFIRMASI BOOKING</DialogTitle>
                    <DialogDescription>Periksa kembali data sebelum dikirim.</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-dashed bg-background p-4">
                      <div className="space-y-2 text-sm">
                        {confirmSnapshot?.pemesanNama || confirmSnapshot?.pemesanEmail || confirmSnapshot?.pemesanNoTelp ? (
                          <>
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-muted-foreground">Pemesan</div>
                              <div className="text-right font-medium">{confirmSnapshot?.pemesanNama || "-"}</div>
                            </div>
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-muted-foreground">Nomor HP</div>
                              <div className="text-right font-medium">{confirmSnapshot?.pemesanNoTelp || "-"}</div>
                            </div>
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-muted-foreground">Email</div>
                              <div className="text-right font-medium">{confirmSnapshot?.pemesanEmail || "-"}</div>
                            </div>
                            <div className="my-2 h-px bg-border" />
                          </>
                        ) : null}
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-muted-foreground">Hari kedatangan</div>
                          <div className="text-right font-medium">{confirmSnapshot?.jadwalTanggal || "-"}</div>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-muted-foreground">Alamat</div>
                          <div className="text-right font-medium whitespace-pre-wrap break-words max-w-[65%]">
                            {confirmSnapshot?.alamat || "-"}
                          </div>
                        </div>
                      </div>
                      <div className="my-3 h-px bg-border" />
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Keluhan</div>
                        <div className="text-sm font-medium whitespace-pre-wrap break-words">
                          {confirmSnapshot?.keluhan || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-dashed bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">Rincian Pembayaran</div>
                        <div className="text-sm font-semibold">{formatRupiah(totalEstimasi)}</div>
                      </div>

                      <div className="mt-3">
                        <Table>
                          <TableHeader className="bg-white">
                            <TableRow className="border-slate-100 hover:bg-transparent">
                              <TableHead className="w-[60px]">No</TableHead>
                              <TableHead>Deskripsi</TableHead>
                              <TableHead className="w-[120px]">PK</TableHead>
                              <TableHead className="w-[160px] text-right">Harga</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="bg-white">
                            {receiptRows.map((row, idx) => (
                              <TableRow key={row.id} className="border-slate-100 hover:bg-transparent">
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className="whitespace-normal">{row.deskripsi}</TableCell>
                                <TableCell>{row.pk}</TableCell>
                                <TableCell className="text-right">{formatRupiah(row.harga)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <TableFooter className="bg-white">
                            <TableRow className="border-slate-100 hover:bg-transparent">
                              <TableCell colSpan={3} className="text-right font-bold h-12">
                                Total layanan
                              </TableCell>
                              <TableCell className="text-right font-bold">{formatRupiah(layananTotal)}</TableCell>
                            </TableRow>
                            <TableRow className="border-slate-100 hover:bg-transparent">
                              <TableCell colSpan={3} className="text-right font-bold h-12">
                                Biaya kunjungan
                              </TableCell>
                              <TableCell className="text-right font-bold">{formatRupiah(BASE_VISIT_FEE)}</TableCell>
                            </TableRow>
                            <TableRow className="border-slate-100 hover:bg-transparent border-t-2">
                              <TableCell colSpan={3} className="text-right font-black text-lg h-16 text-[#66B21D]">
                                Total estimasi
                              </TableCell>
                              <TableCell className="text-right font-black text-lg text-[#66B21D]">{formatRupiah(totalEstimasi)}</TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={isPending} className="rounded-xl">
                        Cancel
                      </Button>
                      <Button type="submit" form={formId} disabled={isPending} className="rounded-xl font-semibold">
                        Konfirmasi
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
