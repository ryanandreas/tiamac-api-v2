"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type ReceiptRow = { id: string; deskripsi: string; pk: string; harga: number }

export function ServiceReceiptDialog({
  triggerText = "Lihat Nota",
  title = "NOTA PESANAN",
  description = "Periksa rincian pesanan dan pembayaran Anda.",
  orderId,
  createdAtText,
  keluhan,
  alamat,
  jadwal,
  catatan,
  rows,
  layananTotal,
  biayaKunjungan,
  totalEstimasi,
  totalFinal,
}: {
  triggerText?: string
  title?: string
  description?: string
  orderId: string
  createdAtText?: string
  keluhan: string
  alamat?: string
  jadwal?: string
  catatan?: string
  rows: ReceiptRow[]
  layananTotal: number
  biayaKunjungan: number
  totalEstimasi: number
  totalFinal?: number | null
}) {
  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader className="text-center">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed bg-background p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="text-muted-foreground">Order ID</div>
                <div className="text-right font-medium whitespace-pre-wrap break-words max-w-[70%]">{orderId}</div>
              </div>
              {createdAtText ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="text-muted-foreground">Tanggal</div>
                  <div className="text-right font-medium whitespace-pre-wrap break-words max-w-[70%]">{createdAtText}</div>
                </div>
              ) : null}
              {alamat ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="text-muted-foreground">Alamat</div>
                  <div className="text-right font-medium whitespace-pre-wrap break-words max-w-[70%]">{alamat}</div>
                </div>
              ) : null}
              {jadwal ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="text-muted-foreground">Jadwal</div>
                  <div className="text-right font-medium whitespace-pre-wrap break-words max-w-[70%]">{jadwal}</div>
                </div>
              ) : null}
            </div>

            <div className="my-3 h-px bg-border" />

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Keluhan / Detail Jasa</div>
              <div className="text-sm font-medium whitespace-pre-wrap break-words">{keluhan || "-"}</div>
            </div>

            {catatan ? (
              <>
                <div className="my-3 h-px bg-border" />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Catatan</div>
                  <div className="text-sm font-medium whitespace-pre-wrap break-words">{catatan}</div>
                </div>
              </>
            ) : null}
          </div>

          <div className="rounded-lg border border-dashed bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium">Rincian Pembayaran</div>
              <div className="text-sm font-semibold">{formatRupiah(totalFinal ?? totalEstimasi)}</div>
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
                  {rows.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="whitespace-normal">{row.deskripsi}</TableCell>
                      <TableCell>{row.pk}</TableCell>
                      <TableCell className="text-right">{formatRupiah(row.harga)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right">
                      Total layanan
                    </TableCell>
                    <TableCell className="text-right">{formatRupiah(layananTotal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right">
                      Biaya kunjungan
                    </TableCell>
                    <TableCell className="text-right">{formatRupiah(biayaKunjungan)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">
                      Total estimasi
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatRupiah(totalEstimasi)}</TableCell>
                  </TableRow>
                  {typeof totalFinal === "number" ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-semibold">
                        Total final
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatRupiah(totalFinal)}</TableCell>
                    </TableRow>
                  ) : null}
                </TableFooter>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

