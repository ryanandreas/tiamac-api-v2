"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Prisma } from "@prisma/client"
import { updateJadwal } from "@/app/actions/jadwal"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type BaseService = Prisma.ServicesGetPayload<{
  include: { customer: true; teknisi: true }
}>

type Technician = { uuid: string; name: string }

interface SchedulingTableProps {
  data: BaseService[]
  teknisi: Technician[]
}

export function SchedulingTable({ data, teknisi }: SchedulingTableProps) {
  const [open, setOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<BaseService | null>(null)
  const [selectedTeknisi, setSelectedTeknisi] = useState<string | undefined>()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const selectClassName =
    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

  const handleScheduleClick = (service: BaseService) => {
    setSelectedService(service)
    setSelectedTeknisi(undefined)
    setSelectedDate(undefined)
    setOpen(true)
  }

  const handleSaveChanges = async () => {
    if (selectedService && selectedTeknisi && selectedDate) {
      const jadwalTanggal = selectedDate.toISOString().slice(0, 10)
      await updateJadwal(selectedService.id, selectedTeknisi, jadwalTanggal)
      setOpen(false)
    }
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Teknisi</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
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
                <TableCell>
                  <Button onClick={() => handleScheduleClick(item)}>Jadwalkan</Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No services to schedule.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwalkan Perbaikan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="col-span-1">Teknisi</p>
              <select
                className={cn(selectClassName, "col-span-3")}
                value={selectedTeknisi ?? ""}
                onChange={(event) => setSelectedTeknisi(event.target.value || undefined)}
              >
                <option value="" disabled>
                  Pilih Teknisi
                </option>
                {teknisi.map((t) => (
                  <option key={t.uuid} value={t.uuid}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="col-span-1">Tanggal</p>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleSaveChanges}>Simpan Jadwal</Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
