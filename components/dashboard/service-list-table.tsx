"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { MoreHorizontal, Plus, Filter } from "lucide-react"
import type { Prisma } from "@prisma/client"
import { cancelServiceEstimate, confirmServiceEstimate } from "@/app/actions/customer"

type BaseService = Prisma.ServicesGetPayload<{
  include: { customer: true; teknisi: true }
}>

type ServiceListItem = BaseService & {
  acUnits?: Array<{
    id: string
    pk: number
    layanan: Array<{ id: string; nama: string; harga?: number }>
  }>
  materialUsages?: Array<{
    id: string
    qty: number
    harga_satuan: number
    item: { nama: string }
  }>
}

interface ServiceListTableProps {
  data: ServiceListItem[]
  showNextStep?: boolean
  enableCustomerApproval?: boolean
}

function nextStepLabel(status: string) {
  switch (status) {
    case "Booking":
      return "Bayar DP Rp 50.000"
    case "Menunggu Jadwal":
      return "Menunggu jadwal"
    case "Teknisi Dikonfirmasi":
      return "Teknisi menuju lokasi"
    case "Dalam Pengecekan":
      return "Menunggu diagnosa"
    case "Menunggu Persetujuan Customer":
      return "Setujui estimasi biaya"
    case "Sedang Dikerjakan":
      return "Sedang dikerjakan"
    case "Pekerjaan Selesai":
      return "Menunggu invoice"
    case "Menunggu Pembayaran":
      return "Bayar invoice"
    case "Selesai (Garansi Aktif)":
      return "Garansi aktif"
    case "Selesai":
      return "Selesai"
    case "Dibatalkan":
      return "Dibatalkan"
    default:
      return "-"
  }
}

export function ServiceListTable({ data, showNextStep, enableCustomerApproval }: ServiceListTableProps) {
  const emptyColSpan = showNextStep ? 8 : 7
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceListItem | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)

  const detail = useMemo(() => {
    if (!selectedService) {
      return {
        rows: [],
        layananTotal: 0,
        materialTotal: 0,
        biayaKunjungan: 50000,
        totalEstimasi: 0,
        alamat: "-",
        jadwal: "-",
      }
    }

    const biayaKunjungan = selectedService.biaya_dasar ?? 50000
    const layananRows =
      selectedService.acUnits?.flatMap((unit, idx) =>
        unit.layanan.map((layanan) => ({
          id: layanan.id,
          deskripsi: `AC ${idx + 1} - ${layanan.nama}`,
          pk: `${unit.pk} PK`,
          harga: layanan.harga ?? 0,
        }))
      ) ?? []

    const materialRows =
      selectedService.materialUsages?.map((u) => ({
        id: u.id,
        deskripsi: `Sparepart: ${u.item.nama} x${u.qty}`,
        pk: "-",
        harga: u.qty * u.harga_satuan,
      })) ?? []

    const rows = [
      ...layananRows,
      ...materialRows,
      {
        id: "biaya-kunjungan",
        deskripsi: "Biaya Kunjungan & Diagnosa",
        pk: "-",
        harga: biayaKunjungan,
      },
    ]

    const layananTotal = layananRows.reduce((sum, r) => sum + r.harga, 0)
    const materialTotal = materialRows.reduce((sum, r) => sum + r.harga, 0)
    const totalEstimasi =
      selectedService.estimasi_biaya ?? biayaKunjungan + layananTotal + materialTotal

    const keluhan = selectedService.keluhan ?? ""
    const alamatLine = keluhan
      .split("\n")
      .find((l) => l.trim().toLowerCase().startsWith("alamat:"))
    const jadwalLine = keluhan
      .split("\n")
      .find((l) => l.trim().toLowerCase().startsWith("jadwal:"))

    return {
      rows,
      layananTotal,
      materialTotal,
      biayaKunjungan,
      totalEstimasi,
      alamat: alamatLine ? alamatLine.replace(/alamat:\s*/i, "") : "-",
      jadwal: jadwalLine ? jadwalLine.replace(/jadwal:\s*/i, "") : "-",
    }
  }, [selectedService])

  const openConfirm = (service: ServiceListItem) => {
    setSelectedService(service)
    setActionError(null)
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedService) return
    setActionBusy(true)
    setActionError(null)
    try {
      const res = await confirmServiceEstimate(selectedService.id)
      if (!res.success) {
        setActionError(res.message ?? "Gagal konfirmasi.")
        return
      }
      setConfirmOpen(false)
      router.refresh()
    } finally {
      setActionBusy(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedService) return
    setActionBusy(true)
    setActionError(null)
    try {
      const res = await cancelServiceEstimate(selectedService.id)
      if (!res.success) {
        setActionError(res.message ?? "Gagal membatalkan.")
        return
      }
      setConfirmOpen(false)
      router.refresh()
    } finally {
      setActionBusy(false)
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search services..."
            className="h-9 w-[300px] bg-background"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filter
            </span>
          </Button>
          <Button size="sm" className="h-9 gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Service
            </span>
          </Button>
        </div>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Teknisi</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              {showNextStep ? <TableHead>Next</TableHead> : null}
              <TableHead>Rincian</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`/images/avatar.png`} alt={item.customer?.name} />
                      <AvatarFallback>{item.customer?.name?.slice(0, 2).toUpperCase() || "CS"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{item.customer?.name}</span>
                      <span className="text-xs text-muted-foreground">{item.customer?.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {item.teknisi ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`/images/avatar.png`} alt={item.teknisi.name} />
                        <AvatarFallback>{item.teknisi.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{item.teknisi.name}</span>
                        <span className="text-xs text-muted-foreground">Technician</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal text-xs">
                    {item.status_servis}
                  </Badge>
                </TableCell>
                {showNextStep ? (
                  <TableCell>
                    <div className="text-xs text-muted-foreground">{nextStepLabel(item.status_servis)}</div>
                  </TableCell>
                ) : null}
                <TableCell>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>{item.acUnits?.length || 0} unit</div>
                    {item.acUnits?.slice(0, 2).map((u, idx) => (
                      <div key={u.id}>
                        AC {idx + 1}: {u.pk} PK{" "}
                        {u.layanan.length ? `• ${u.layanan.map((l) => l.nama).join(", ")}` : ""}
                      </div>
                    ))}
                    {item.acUnits && item.acUnits.length > 2 ? (
                      <div>+{item.acUnits.length - 2} lainnya</div>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {(() => {
                      const val = item.biaya ?? item.estimasi_biaya ?? null
                      return val ? `Rp ${val.toLocaleString("id-ID")}` : "-"
                    })()}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {enableCustomerApproval && item.status_servis === "Menunggu Persetujuan Customer" ? (
                        <DropdownMenuItem onClick={() => openConfirm(item)}>
                          Konfirmasi
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Update status</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={emptyColSpan} className="h-24 text-center text-muted-foreground">
                  No services found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Konfirmasi Biaya Servis</DialogTitle>
            <DialogDescription>Periksa rincian biaya sebelum konfirmasi.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-dashed bg-background p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-muted-foreground">Order ID</div>
                  <div className="text-right font-medium whitespace-pre-wrap break-words max-w-[70%]">
                    {selectedService?.id ?? "-"}
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-muted-foreground">Customer</div>
                  <div className="text-right font-medium whitespace-pre-wrap break-words max-w-[70%]">
                    {selectedService?.customer?.name ?? "-"}
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-muted-foreground">Alamat</div>
                  <div className="text-right font-medium whitespace-pre-wrap break-words max-w-[70%]">
                    {detail.alamat}
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-muted-foreground">Jadwal</div>
                  <div className="text-right font-medium whitespace-pre-wrap break-words max-w-[70%]">
                    {detail.jadwal}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-dashed bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">Rincian Biaya</div>
                <div className="text-sm font-semibold">{formatRupiah(detail.totalEstimasi)}</div>
              </div>
              <div className="mt-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">No</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="w-[120px]">PK</TableHead>
                      <TableHead className="w-[160px] text-right">Harga</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.rows.map((row, idx) => (
                      <TableRow key={row.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="whitespace-normal">{row.deskripsi}</TableCell>
                        <TableCell>{row.pk}</TableCell>
                        <TableCell className="text-right">{formatRupiah(row.harga)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {actionError ? <div className="text-sm text-destructive">{actionError}</div> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={actionBusy}>
              Batalkan
            </Button>
            <Button onClick={handleConfirm} disabled={actionBusy}>
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
