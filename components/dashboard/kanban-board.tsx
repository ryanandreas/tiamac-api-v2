"use client"

import * as React from "react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Prisma } from "@prisma/client"


type KanbanItem = Prisma.ServicesGetPayload<{
  include: { customer: true; teknisi: true }
}>

interface KanbanBoardProps {
  data: KanbanItem[]
}

const STATUS_COLUMNS = [
  { id: "Menunggu Jadwal", label: "Menunggu Jadwal", color: "bg-yellow-100 text-yellow-800" },
  { id: "Teknisi Dikonfirmasi", label: "Teknisi Dikonfirmasi", color: "bg-blue-100 text-blue-800" },
  { id: "Dalam Pengecekan", label: "Dalam Pengecekan", color: "bg-indigo-100 text-indigo-800" },
  { id: "Menunggu Persetujuan Customer", label: "Menunggu Persetujuan", color: "bg-purple-100 text-purple-800" },
  { id: "Sedang Dikerjakan", label: "Sedang Dikerjakan", color: "bg-orange-100 text-orange-800" },
  { id: "Pekerjaan Selesai", label: "Pekerjaan Selesai", color: "bg-teal-100 text-teal-800" },
  { id: "Menunggu Pembayaran", label: "Menunggu Pembayaran", color: "bg-red-100 text-red-800" },
]

export function KanbanBoard({ data }: KanbanBoardProps) {
  // Group data by status
  const groupedData = React.useMemo(() => {
    const groups: Record<string, KanbanItem[]> = {}
    STATUS_COLUMNS.forEach(col => {
      groups[col.id] = []
    })
    
    data.forEach(item => {
      if (groups[item.status_servis]) {
        groups[item.status_servis].push(item)
      }
    })
    return groups
  }, [data])

  return (
    <div className="flex h-full gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
      {STATUS_COLUMNS.map((column) => (
        <div key={column.id} className="flex h-full min-w-[250px] max-w-[250px] flex-col rounded-md border bg-muted/30 p-2 snap-center">
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="font-semibold text-xs truncate" title={column.label}>{column.label}</h3>
            <Badge variant="outline" className="rounded-full px-1.5 py-0 text-[10px] h-5 min-w-5 flex justify-center">
              {groupedData[column.id]?.length || 0}
            </Badge>
          </div>
          <ScrollArea className="h-full pr-2">
            <div className="flex flex-col gap-2">
              {groupedData[column.id]?.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-sm transition-all border-l-2" style={{ borderLeftColor: item.teknisi ? '#3b82f6' : '#e5e7eb' }}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium text-xs leading-none line-clamp-1" title={item.jenis_servis}>
                        {item.jenis_servis}
                      </span>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight" title={item.keluhan}>
                      {item.keluhan}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex -space-x-1.5">
                        <Avatar className="h-5 w-5 border-2 border-background" title={`Customer: ${item.customer?.name}`}>
                          <AvatarImage src="/images/avatar.png" />
                          <AvatarFallback className="text-[8px]">C</AvatarFallback>
                        </Avatar>
                        {item.teknisi && (
                          <Avatar className="h-5 w-5 border-2 border-background" title={`Teknisi: ${item.teknisi.name}`}>
                            <AvatarImage src="/images/avatar.png" />
                            <AvatarFallback className="text-[8px] bg-blue-100 text-blue-700">T</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-foreground/80">
                        {item.biaya || item.estimasi_biaya ? 
                          `Rp ${(item.biaya || item.estimasi_biaya).toLocaleString()}` : 
                          "-"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!groupedData[column.id] || groupedData[column.id].length === 0) && (
                <div className="flex h-16 items-center justify-center rounded border border-dashed text-[10px] text-muted-foreground bg-background/50">
                  Empty
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  )
}
