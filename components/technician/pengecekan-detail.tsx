"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import {
  addMaterialUsage,
  addUnitLayanan,
  removeMaterialUsage,
  removeUnitLayanan,
  submitPengecekan,
} from "@/app/actions/teknisi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

export function PengecekanDetail({
  serviceId,
  statusServis,
  customerName,
  customerAlamat,
  jadwal,
  biayaDasar,
  acUnits,
  catalogRows,
  inventoryItems,
  usages,
  alamatServis,
}: {
  serviceId: string
  statusServis: string
  customerName: string
  customerAlamat: string
  jadwal?: string | null
  biayaDasar: number
  acUnits: ServiceUnit[]
  catalogRows: CatalogRow[]
  inventoryItems: InventoryItem[]
  usages: UsageItem[]
  alamatServis?: string | null
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

  const estimasiAwal = useMemo(() => biayaDasar + layananTotal, [biayaDasar, layananTotal])

  const totalPreview = useMemo(() => {
    const jasa = Math.floor(Number(jasaTambahan))
    if (!Number.isFinite(jasa) || jasa < 0) return null
    return estimasiAwal + materialTotal + jasa
  }, [estimasiAwal, jasaTambahan, materialTotal])

  const selectClassName =
    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

  const canEdit = statusServis === "Konfirmasi Teknisi" || statusServis === "Dalam Pengecekan"

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

  async function handleAddLayanan() {
    setBusy(true)
    setError(null)
    try {
      const res = await addUnitLayanan({
        unitId: selectedUnitId,
        catalogId: selectedCatalogId,
      })
      if (!res.success) setError(res.message ?? "Gagal menambah layanan.")
      setSelectedCatalogId("")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleRemoveLayanan(unitLayananId: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await removeUnitLayanan({ unitLayananId })
      if (!res.success) setError(res.message ?? "Gagal menghapus layanan.")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleAddUsage() {
    setBusy(true)
    setError(null)
    try {
      const res = await addMaterialUsage({
        serviceId,
        itemId: selectedItemId,
        qty: Number(qty),
        notes: notes.trim() || undefined,
      })
      if (!res.success) setError(res.message ?? "Gagal menambah barang.")
      setSelectedItemId("")
      setQty("1")
      setNotes("")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleRemoveUsage(usageId: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await removeMaterialUsage({ usageId })
      if (!res.success) setError(res.message ?? "Gagal menghapus barang.")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmitPengecekan() {
    setBusy(true)
    setError(null)
    try {
      const res = await submitPengecekan({
        serviceId,
        diagnosa,
        jasaTambahan: Number(jasaTambahan),
      })
      if (!res.success) {
        setError(res.message ?? "Gagal submit pengecekan.")
        return
      }
      router.push("/dashboard/pengecekan")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Info Servis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="secondary" className="font-normal">
              {statusServis}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pelanggan</span>
            <span className="text-right">{customerName}</span>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Alamat</div>
            <div className="text-sm">{alamatServis || customerAlamat || "-"}</div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tanggal</span>
            <span>{jadwal || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estimasi awal</span>
            <span>Rp {estimasiAwal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Material</span>
            <span>Rp {materialTotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Preview total</span>
            <span>{totalPreview === null ? "-" : `Rp ${totalPreview.toLocaleString("id-ID")}`}</span>
          </div>
          {error ? <div className="text-sm text-destructive">{error}</div> : null}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Pengecekan & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={cn("space-y-4", !canEdit && "opacity-60")}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Layanan Servis</div>
              <div className="text-xs text-muted-foreground">
                Total layanan: Rp {layananTotal.toLocaleString("id-ID")}
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acUnits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Tidak ada data unit AC.
                      </TableCell>
                    </TableRow>
                  ) : (
                    acUnits.flatMap((unit, unitIdx) => {
                      if (unit.layanan.length === 0) {
                        return (
                          <TableRow key={`${unit.id}-empty`}>
                            <TableCell>AC {unitIdx + 1} ({unit.pk} PK)</TableCell>
                            <TableCell className="text-muted-foreground italic">Belum ada layanan</TableCell>
                            <TableCell className="text-right">-</TableCell>
                            <TableCell className="text-right">-</TableCell>
                          </TableRow>
                        )
                      }
                      return unit.layanan.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>AC {unitIdx + 1} ({unit.pk} PK)</TableCell>
                          <TableCell className="whitespace-normal">{l.nama}</TableCell>
                          <TableCell className="text-right">Rp {l.harga.toLocaleString("id-ID")}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveLayanan(l.id)}
                              disabled={!canEdit || busy}
                            >
                              Hapus
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-5">
                <div className="text-sm font-medium mb-1">Pilih Unit</div>
                <select
                  className={selectClassName}
                  value={selectedUnitId}
                  onChange={(e) => {
                    setSelectedUnitId(e.target.value)
                    setSelectedCatalogId("")
                  }}
                  disabled={!canEdit || busy}
                >
                  <option value="" disabled>
                    Pilih unit AC
                  </option>
                  {unitOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-7">
                <div className="text-sm font-medium mb-1">Tambah Layanan</div>
                <select
                  className={selectClassName}
                  value={selectedCatalogId}
                  onChange={(e) => setSelectedCatalogId(e.target.value)}
                  disabled={!canEdit || busy || !selectedUnitId}
                >
                  <option value="" disabled>
                    {selectedUnitId ? "Pilih layanan" : "Pilih unit dulu"}
                  </option>
                  {layananOptions.map((o) => (
                    <option key={o.uuid} value={o.uuid}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-12">
                <Button
                  variant="outline"
                  onClick={handleAddLayanan}
                  disabled={!canEdit || busy || !selectedUnitId || !selectedCatalogId}
                >
                  Tambah Layanan
                </Button>
              </div>
            </div>
          </div>

          <div className={cn("grid gap-3 md:grid-cols-12", !canEdit && "opacity-60")}>
            <div className="md:col-span-6">
              <div className="text-sm font-medium mb-1">Barang</div>
              <select
                className={selectClassName}
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                disabled={!canEdit || busy}
              >
                <option value="" disabled>
                  Pilih barang inventory
                </option>
                {inventoryItems.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.nama} ({it.qtyOnHand} {it.uom}) - Rp {it.harga.toLocaleString("id-ID")}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm font-medium mb-1">Qty</div>
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                disabled={!canEdit || busy}
              />
            </div>
            <div className="md:col-span-4">
              <div className="text-sm font-medium mb-1">Catatan</div>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!canEdit || busy}
                placeholder="Opsional"
              />
            </div>
            <div className="md:col-span-12">
              <Button
                variant="outline"
                onClick={handleAddUsage}
                disabled={!canEdit || busy || !selectedItemId}
              >
                Tambah Barang
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Belum ada barang dipakai.
                    </TableCell>
                  </TableRow>
                ) : (
                  usages.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="text-sm font-medium">{u.item.nama}</div>
                        {u.notes ? <div className="text-xs text-muted-foreground">{u.notes}</div> : null}
                      </TableCell>
                      <TableCell>
                        {u.qty} {u.item.uom}
                      </TableCell>
                      <TableCell className="text-right">
                        Rp {(u.qty * u.harga_satuan).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveUsage(u.id)}
                          disabled={!canEdit || busy}
                        >
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className={cn("grid gap-3 md:grid-cols-12", !canEdit && "opacity-60")}>
            <div className="md:col-span-8">
              <div className="text-sm font-medium mb-1">Diagnosa</div>
              <Textarea
                value={diagnosa}
                onChange={(e) => setDiagnosa(e.target.value)}
                disabled={!canEdit || busy}
                placeholder="Tulis rincian kerusakan dan servis yang diperlukan"
              />
            </div>
            <div className="md:col-span-4">
              <div className="text-sm font-medium mb-1">Jasa tambahan (Rp)</div>
              <Input
                type="number"
                min={0}
                value={jasaTambahan}
                onChange={(e) => setJasaTambahan(e.target.value)}
                disabled={!canEdit || busy}
              />
              <div className="mt-2 text-xs text-muted-foreground">
                Total akan dihitung dari layanan + material + jasa tambahan.
              </div>
            </div>
            <div className="md:col-span-12">
              <Button onClick={handleSubmitPengecekan} disabled={!canEdit || busy}>
                Kirim Estimasi ke Customer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
