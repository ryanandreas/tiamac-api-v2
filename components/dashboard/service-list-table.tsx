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
import { MoreHorizontal, Plus, Filter, Receipt, Copy, Check, Search, Edit2, Trash2 } from "lucide-react"
import type { Prisma } from "@prisma/client"
import { cancelServiceEstimate, confirmServiceEstimate } from "@/app/actions/customer"
import { ServiceStatusHistoryDialog } from "./service-status-history-dialog"

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
  isCustomerView?: boolean
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

export function ServiceListTable({ 
  data, 
  showNextStep, 
  enableCustomerApproval,
  isCustomerView = false 
}: ServiceListTableProps) {
  const emptyColSpan = isCustomerView ? (showNextStep ? 6 : 5) : (showNextStep ? 8 : 7)
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceListItem | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedDetailServiceId, setSelectedDetailServiceId] = useState<string | null>(null)

  const openDetail = (service: ServiceListItem) => {
    setSelectedDetailServiceId(service.id)
    setDetailOpen(true)
  }

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(text)
      setTimeout(() => setCopiedId(null), 2000) // Reset after 2 seconds
    })
  }

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
    <div className="flex flex-col">
      {!isCustomerView && (
        <div className="px-6 py-6 border-b border-slate-50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
            <Input
              placeholder="Cari pesanan..."
              className="pl-10 h-10 text-[11px] font-semibold border-slate-100 rounded-xl focus-visible:ring-[#66B21D] shadow-none placeholder:text-slate-300 bg-slate-50/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10 border-slate-100 rounded-xl text-slate-400 hover:text-[#66B21D] hover:bg-green-50 transition-all">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className={isCustomerView ? "" : "bg-slate-50/30"}>
            <TableRow className="border-slate-50 hover:bg-transparent">
              <TableHead className={`h-12 text-[10px] font-bold text-slate-400 ${isCustomerView ? "pl-6" : "pl-8"}`}>
                {isCustomerView ? "No. Pesanan" : "ID Pesanan"}
              </TableHead>
              {!isCustomerView && (
                <TableHead className="h-12 text-[10px] font-bold text-slate-400">Customer</TableHead>
              )}
              <TableHead className="h-12 text-[10px] font-bold text-slate-400">Teknisi</TableHead>
              <TableHead className="h-12 text-[10px] font-bold text-slate-400">Tanggal</TableHead>
              <TableHead className="h-12 text-[10px] font-bold text-slate-400 text-center">Status</TableHead>
              {!isCustomerView && showNextStep ? <TableHead className="h-12 text-[10px] font-bold text-slate-400">Next Step</TableHead> : null}
              <TableHead className="h-12 text-[10px] font-bold text-slate-400 text-right pr-8">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className="border-slate-50 group hover:bg-slate-50/30 transition-colors">
                <TableCell className={`${isCustomerView ? "pl-6 py-6" : "pl-8 py-6"}`}>
                   <div className="flex items-center gap-2">
                       <span className={`font-black tracking-tight ${isCustomerView ? "text-slate-900" : "text-slate-500 text-xs"}`}>
                        #{item.id.slice(0, 8).toUpperCase()}
                      </span>
                      {isCustomerView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-300 hover:text-slate-600 transition-colors"
                          onClick={() => copyToClipboard(item.id)}
                        >
                          {copiedId === item.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                </TableCell>

                {!isCustomerView && (
                  <TableCell className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] shrink-0">
                        {item.customer?.name?.slice(0, 2).toUpperCase() || "CS"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-sm text-slate-900 truncate">{item.customer?.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 truncate">{item.customer?.email}</span>
                      </div>
                    </div>
                  </TableCell>
                )}

                <TableCell className="py-6">
                  {item.teknisi ? (
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-green-50 flex items-center justify-center text-[#66B21D] font-black text-[10px] shrink-0">
                        {item.teknisi.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-slate-900 truncate">{item.teknisi.name}</span>
                        <span className="text-[10px] font-bold text-[#66B21D]">Teknisi</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-300 italic">
                      <div className="size-8 rounded-lg border border-dashed border-slate-200" />
                      <span className="text-xs font-bold">Unassigned</span>
                    </div>
                  )}
                </TableCell>

                <TableCell className="py-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(item.createdAt).getFullYear()}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-6 text-center">
                   <Badge 
                    className={`px-3 py-1 rounded-lg font-bold text-[9px] border-none ${
                      item.status_servis === "Booking" 
                        ? "bg-blue-100 text-blue-600" 
                        : item.status_servis.startsWith("Selesai")
                          ? "bg-green-100 text-[#66B21D]"
                          : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {item.status_servis}
                  </Badge>
                </TableCell>

                {!isCustomerView && showNextStep ? (
                  <TableCell className="py-6">
                    <span className="text-[10px] font-bold text-slate-400 leading-tight block max-w-[120px]">
                      {nextStepLabel(item.status_servis)}
                    </span>
                  </TableCell>
                ) : null}

                <TableCell className="py-6 pr-8 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!isCustomerView ? (
                      <>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-100 text-slate-400 hover:text-[#66B21D] hover:border-green-100 hover:bg-green-50 transition-all">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl shadow-slate-200/50">
                          <DropdownMenuLabel className="text-[10px] font-bold text-slate-400">Opsi Pesanan</DropdownMenuLabel>
                          {enableCustomerApproval && item.status_servis === "Menunggu Persetujuan Customer" ? (
                            <DropdownMenuItem onClick={() => openConfirm(item)} className="text-xs font-bold text-[#66B21D] focus:bg-green-50 focus:text-[#66B21D]">
                              Konfirmasi Estimasi
                            </DropdownMenuItem>
                          ) : null}
                          {isCustomerView && (
                            <DropdownMenuItem onClick={() => openDetail(item)} className="text-xs font-bold text-slate-600">
                              <Receipt className="mr-2 h-3.5 w-3.5" />
                              <span>Detail Servis</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-xs font-bold text-slate-600">Update Status</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={emptyColSpan} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200 mb-2">
                      <Search className="h-5 w-5" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400">Tidak ada pesanan ditemukan</p>
                  </div>
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

      <ServiceStatusHistoryDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        serviceId={selectedDetailServiceId}
      />
    </div>
  )
}
