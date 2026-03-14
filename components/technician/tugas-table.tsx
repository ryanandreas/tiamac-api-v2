"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "Teknisi Dikonfirmasi", label: "Teknisi Dikonfirmasi" },
  { value: "Dalam Pengecekan", label: "Dalam Pengecekan" },
  { value: "Menunggu Persetujuan Customer", label: "Menunggu Persetujuan Customer" },
  { value: "Sedang Dikerjakan", label: "Sedang Dikerjakan" },
]

function extractJadwal(keluhan: string) {
  const match = keluhan.match(/^Jadwal:\s*(.+)$/im)
  return match?.[1]?.trim()
}

function actionForStatus(status: string, serviceId: string) {
  if (status === "Sedang Dikerjakan") {
    return { href: `/dashboard/pengerjaan/${serviceId}`, label: "Upload Bukti" }
  }
  if (status === "Menunggu Persetujuan Customer") {
    return { href: `/dashboard/pengecekan/${serviceId}`, label: "Lihat Detail" }
  }
  if (status === "Dalam Pengecekan" || status === "Teknisi Dikonfirmasi") {
    return { href: `/dashboard/pengecekan/${serviceId}`, label: "Input Pengecekan" }
  }
  return null
}

type TaskRow = {
  id: string
  jenis_servis: string
  keluhan: string
  status_servis: string
  customer: {
    name: string
    email: string | null
    customerProfile: { no_telp: string | null; alamat: string | null } | null
  }
}

export function TugasTable({
  tasks,
  selectedStatus,
}: {
  tasks: TaskRow[]
  selectedStatus: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    const next = params.toString()
    router.replace(`/dashboard/tugas${next ? `?${next}` : ""}`)
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          name="status"
          value={selectedStatus}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          onChange={(event) => handleStatusChange(event.currentTarget.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Tanggal Perbaikan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Tidak ada tugas aktif saat ini.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => {
                const jadwal = extractJadwal(task.keluhan ?? "")
                const action = actionForStatus(task.status_servis, task.id)

                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{task.customer.name}</span>
                        <span className="text-xs text-muted-foreground">{task.jenis_servis}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{task.customer.customerProfile?.no_telp || "-"}</div>
                      <div className="text-xs text-muted-foreground">{task.customer.email || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{jadwal || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal text-xs">
                        {task.status_servis}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {task.customer.customerProfile?.alamat || "Alamat tidak tersedia"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {action ? (
                        <Button size="sm" asChild>
                          <Link href={action.href}>
                            {action.label}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" disabled>
                          Tidak ada aksi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

