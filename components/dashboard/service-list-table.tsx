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
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { MoreHorizontal, Filter, Copy, Check, Search, Edit2, Trash2, Eye, XCircle } from "lucide-react"
import Link from "next/link"
import type { Prisma } from "@prisma/client"
import { cancelServiceEstimate, confirmServiceEstimate } from "@/app/actions/customer"
import { deleteService } from "@/app/actions/admin-actions"
import { ServiceStatusHistoryDialog } from "./service-status-history-dialog"
import { PaymentButton } from "@/components/payment/PaymentButton"

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
  hideEdit?: boolean
}

function nextStepLabel(status: string) {
  switch (status) {
    case "Booking":
      return "Bayar DP Rp 50.000"
    case "Menunggu Jadwal":
      return "Menunggu jadwal"
    case "Konfirmasi Teknisi":
      return "Teknisi menuju lokasi"
    case "Pengecekan Unit":
      return "Menunggu diagnosa"
    case "Menunggu Persetujuan Customer":
      return "Setujui estimasi biaya"
    case "Perbaikan Unit":
      return "Proses perbaikan & pelunasan"
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
  isCustomerView = false,
  hideEdit = false
}: ServiceListTableProps) {
  const emptyColSpan = isCustomerView ? (showNextStep ? 6 : 5) : (showNextStep ? 8 : 7)
  const router = useRouter()
  
  // States
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceListItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedDetailServiceId, setSelectedDetailServiceId] = useState<string | null>(null)
  const [approvalMode, setApprovalMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Handlers
  const openDetail = (serviceId: string) => {
    setSelectedDetailServiceId(serviceId)
    setApprovalMode(false)
    setDetailOpen(true)
  }

  const openApproveDialog = (service: ServiceListItem) => {
    setSelectedDetailServiceId(service.id)
    setSelectedService(service)
    setApprovalMode(true)
    setDetailOpen(true)
  }

  const openCancelDialog = (service: ServiceListItem) => {
    setSelectedService(service)
    setActionError(null)
    setConfirmOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return
    setActionBusy(true)
    try {
      const res = await deleteService(serviceToDelete)
      if (res?.success) {
        setDeleteDialogOpen(false)
        router.refresh()
      } else {
        alert(res?.message || "Gagal menghapus pesanan")
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem")
    } finally {
      setActionBusy(false)
    }
  }

  const handleApproveFromDialog = async () => {
    if (!selectedDetailServiceId) return
    setActionBusy(true)
    setActionError(null)
    try {
      const res = await confirmServiceEstimate(selectedDetailServiceId)
      if (!res.success) {
        alert(res.message ?? "Gagal konfirmasi.")
        return
      }
      setDetailOpen(false)
      router.refresh()
    } catch (err) {
      alert("Terjadi kesalahan saat mengonfirmasi estimasi")
    } finally {
      setActionBusy(false)
    }
  }

  const handleCancelAction = async () => {
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
    } catch (err) {
      setActionError("Terjadi kesalahan sistem")
    } finally {
      setActionBusy(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(text)
      setTimeout(() => setCopiedId(null), 2000)
    })
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
                      #{item.id.slice(-8).toUpperCase()}
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
                    className={`px-3 py-1 rounded-lg font-bold text-[9px] border-none ${item.status_servis === "Booking"
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
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => openDetail(item.id)}
                          className="h-8 w-8 rounded-lg border-slate-100 text-slate-400 hover:text-[#66B21D] hover:border-green-100 hover:bg-green-50 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {!hideEdit && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            asChild
                            className="h-8 w-8 rounded-lg border-slate-100 text-slate-400 hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50 transition-all"
                          >
                            <Link href={`/dashboard/servis/${item.id}/edit`}>
                               <Edit2 className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDeleteClick(item.id)}
                          className="h-8 w-8 rounded-lg border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                        >
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
                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl shadow-slate-200/50 min-w-[200px] p-2">
                          <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Opsi Pesanan
                          </DropdownMenuLabel>
                          
                          <DropdownMenuItem onClick={() => openDetail(item.id)} className="rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:bg-slate-50">
                            <Eye className="mr-3 h-4 w-4 text-slate-400" />
                            <span>Detail Servis</span>
                          </DropdownMenuItem>

                          {item.status_servis === "Booking" && (
                            <div className="px-2 py-1">
                              <PaymentButton 
                                serviceId={item.id} 
                                type="DOWN_PAYMENT" 
                                amount={item.biaya_dasar ?? 50000} 
                                label="Bayar DP Rp 50.000"
                                className="w-full justify-start h-9 bg-[#66B21D] hover:bg-[#4d9e0f] text-white rounded-xl font-bold text-[11px] gap-2"
                              />
                            </div>
                          )}

                          {(item.status_servis === "Menunggu Pembayaran" || item.status_servis === "Perbaikan Unit") && (
                            <div className="px-2 py-1">
                              <PaymentButton 
                                serviceId={item.id} 
                                type="FULL_PAYMENT" 
                                amount={item.biaya ?? 0} 
                                label="Bayar Pelunasan"
                                className="w-full justify-start h-9 bg-[#66B21D] hover:bg-[#4d9e0f] text-white rounded-xl font-bold text-[11px] gap-2"
                              />
                            </div>
                          )}

                          {enableCustomerApproval && item.status_servis === "Menunggu Persetujuan Customer" && (
                            <DropdownMenuItem onClick={() => openApproveDialog(item)} className="rounded-xl px-3 py-2.5 text-xs font-bold text-[#66B21D] focus:bg-green-50 focus:text-[#66B21D]">
                               <Check className="mr-3 h-4 w-4" />
                               Konfirmasi Estimasi
                            </DropdownMenuItem>
                          )}

                          {["Booking", "Menunggu Jadwal", "Konfirmasi Teknisi", "Dalam Pengecekan", "Menunggu Persetujuan Customer"].includes(item.status_servis) && (
                            <DropdownMenuItem onClick={() => openCancelDialog(item)} className="rounded-xl px-3 py-2.5 text-xs font-bold text-red-500 focus:bg-red-50 focus:text-red-600">
                              <XCircle className="mr-3 h-4 w-4" />
                              Batalkan
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cancellation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
          <div className="bg-white p-8 space-y-6">
            <div className="size-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-sm border border-red-100/50">
              <XCircle className="size-8" />
            </div>
            
            <div className="space-y-2 text-center">
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Batalkan Pesanan?</DialogTitle>
              <DialogDescription className="text-sm font-bold text-slate-500 font-medium leading-relaxed">
                Tindakan ini akan membatalkan seluruh proses pengerjaan untuk pesanan #{selectedService?.id.slice(-8).toUpperCase()} ini.
              </DialogDescription>
            </div>

            {actionError && <div className="p-3 bg-red-50 text-red-500 text-[10px] font-bold rounded-lg border border-red-100">{actionError}</div>}

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setConfirmOpen(false)}
                className="h-12 rounded-2xl font-black text-xs bg-slate-50 hover:bg-slate-100 text-slate-400 transition-all border-none"
                disabled={actionBusy}
              >
                Kembali
              </Button>
              <Button 
                onClick={handleCancelAction}
                className="h-12 rounded-2xl font-black text-xs bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all active:scale-95 border-none"
                disabled={actionBusy}
              >
                {actionBusy ? "Proses..." : "Ya, Batalkan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog (Admin Only) */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Pesanan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={actionBusy}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={actionBusy}>
              {actionBusy ? "Menghapus..." : "Hapus Pesanan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Premium Detail & Approval Dialog */}
      <ServiceStatusHistoryDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        serviceId={selectedDetailServiceId}
        showApprovalActions={approvalMode}
        onApprove={handleApproveFromDialog}
        isApproving={actionBusy}
      />
    </div>
  )
}
