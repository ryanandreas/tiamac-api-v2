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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Plus, Filter } from "lucide-react"
import type { Prisma } from "@prisma/client"

type BaseService = Prisma.ServicesGetPayload<{
  include: { customer: true; teknisi: true }
}>

type ServiceListItem = BaseService & {
  acUnits?: Array<{
    id: string
    pk: number
    layanan: Array<{ id: string; nama: string }>
  }>
}

interface ServiceListTableProps {
  data: ServiceListItem[]
  showNextStep?: boolean
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

export function ServiceListTable({ data, showNextStep }: ServiceListTableProps) {
  const emptyColSpan = showNextStep ? 8 : 7
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
    </div>
  )
}
