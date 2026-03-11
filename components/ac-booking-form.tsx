"use client"

import * as React from "react"
import { useActionState } from "react"
import { createAcBooking } from "@/app/actions/booking"
import type { CreateBookingState } from "@/app/actions/booking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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

export function AcBookingForm({ catalogRows }: { catalogRows: CatalogRow[] }) {
  const [state, formAction, isPending] = useActionState<CreateBookingState, FormData>(
    createAcBooking,
    null
  )

  const [units, setUnits] = React.useState<UnitState[]>([{ pk: undefined, layanan: [] }])
  const [coords, setCoords] = React.useState<{ lat?: number; lng?: number }>({})
  const [geoError, setGeoError] = React.useState<string | null>(null)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pesan Servis Teknisi ke Lokasi Anda</h1>
        <p className="text-muted-foreground text-sm">Khusus untuk servis AC.</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">💰 Estimasi Biaya Dasar</CardTitle>
          <CardDescription>Biaya kunjungan & diagnosa (wajib jelas).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between rounded-md border bg-background px-4 py-3">
            <div>
              <div className="font-semibold">💵 Biaya Kunjungan & Diagnosa</div>
              <div className="text-xs text-muted-foreground">
                Biaya ini tetap dibayar jika perbaikan tidak dilanjutkan.
              </div>
            </div>
            <div className="text-lg font-bold">Rp 50.000</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Total Estimasi</CardTitle>
          <CardDescription>Biaya kunjungan + layanan yang Anda pilih.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-md border bg-background px-4 py-3">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-lg font-bold">{formatRupiah(totalEstimasi)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Booking</CardTitle>
          <CardDescription>Isi detail servis AC dan jadwal kedatangan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            {state?.message ? (
              <div className="text-sm font-medium text-destructive">{state.message}</div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="keluhan">Keluhan / Deskripsi Masalah</Label>
              <Textarea
                id="keluhan"
                name="keluhan"
                placeholder="AC tidak dingin & berisik"
                rows={4}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Alamat & Map Picker</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={detectLocation}>
                    Auto-detect lokasi
                  </Button>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <a href={mapsHref} target="_blank" rel="noreferrer">
                      Pin titik rumah
                    </a>
                  </Button>
                </div>
              </div>
              {geoError ? <div className="text-xs text-destructive">{geoError}</div> : null}
              <Textarea id="alamat" name="alamat" placeholder="Alamat lengkap lokasi Anda" rows={3} required />
              <div className="text-xs text-muted-foreground">
                Gunakan auto-detect lalu pin lokasi Anda di peta.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jadwal_tanggal">Pilih Jadwal Kedatangan (Tanggal)</Label>
                <Input id="jadwal_tanggal" name="jadwal_tanggal" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jadwal_jam">Pilih Jadwal Kedatangan (Jam)</Label>
                <Input id="jadwal_jam" name="jadwal_jam" type="time" required />
              </div>
            </div>

            <div className="space-y-5">
              <input type="hidden" name="units_json" value={unitsJson} />

              {layananList.length === 0 ? (
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
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
                  variant="outline"
                  size="sm"
                  onClick={() => setUnits((prev) => [...prev, { pk: undefined, layanan: [] }])}
                >
                  +
                </Button>
              </div>

              <div className="space-y-4">
                {units.map((unit, index) => {
                  const pk = unit.pk ? String(unit.pk) : undefined
                  const unitTotal = calcUnitTotal(unit, catalog)
                  return (
                    <Card key={index} className="border-muted">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                          <CardTitle className="text-base">AC {index + 1}</CardTitle>
                          {units.length > 1 ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setUnits((prev) => prev.filter((_, i) => i !== index))}
                            >
                              Hapus
                            </Button>
                          ) : null}
                        </div>
                        <CardDescription>
                          Estimasi layanan unit ini: {formatRupiah(unitTotal)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                                      prev.map((u, i) =>
                                        i === index ? { ...u, pk: value, layanan: u.layanan } : u
                                      )
                                    )
                                  }
                                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
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
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              {layananList.map((layananName) => {
                                const item = catalog[layananName]
                                const price = (pk ? item.priceByPk[pk] : undefined) ?? item.defaultPrice ?? 0
                                const checked = unit.layanan.includes(layananName)
                                return (
                                  <button
                                    key={layananName}
                                    type="button"
                                    onClick={() => {
                                      setUnits((prev) =>
                                        prev.map((u, i) => {
                                          if (i !== index) return u
                                          const next = checked
                                            ? u.layanan.filter((x) => x !== layananName)
                                            : [...u.layanan, layananName]
                                          return { ...u, layanan: next }
                                        })
                                      )
                                    }}
                                    className={`flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors ${
                                      checked ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <div className="font-medium">{layananName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {item.defaultPrice !== undefined && Object.keys(item.priceByPk).length === 0
                                          ? "Harga tetap"
                                          : "Harga sesuai PK"}
                                      </div>
                                    </div>
                                    <div className="font-semibold">{formatRupiah(price)}</div>
                                  </button>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                              Pilih PK AC terlebih dahulu untuk menampilkan layanan.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border bg-muted/30 p-3">
              <input
                id="agree_biaya_kunjungan"
                name="agree_biaya_kunjungan"
                type="checkbox"
                className="mt-1 h-4 w-4"
                required
              />
              <Label htmlFor="agree_biaya_kunjungan" className="text-sm leading-5">
                Saya menyetujui biaya kunjungan
              </Label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Memproses..." : "Booking Sekarang"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
