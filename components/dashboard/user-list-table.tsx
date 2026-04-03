"use client"

import * as React from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Search, User, Mail, Shield, Clock, Edit2, Trash2, Filter } from "lucide-react"
import type { Prisma } from "@prisma/client"

type UserListTableProps =
  | {
      type: "staff"
      data: Prisma.StaffProfileGetPayload<{ include: { user: true } }>[]
    }
  | {
      type: "customer"
      data: Prisma.CustomerProfileGetPayload<{ include: { user: true } }>[]
    }

export function UserListTable({ data, type }: UserListTableProps) {
  return (
    <div className="bg-transparent">
        <div className="px-8 py-6 border-b border-slate-50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors pointer-events-none" />
            <Input
              placeholder={`Cari ${type === "staff" ? "staff" : "customer"}...`}
              className="pl-10 h-10 text-[11px] font-semibold border-slate-100 rounded-xl focus-visible:ring-[#66B21D] shadow-none placeholder:text-slate-300 bg-slate-50/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10 border-slate-100 rounded-xl text-slate-400 hover:text-[#66B21D] hover:bg-green-50 transition-all">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/10">
              <TableRow className="border-slate-50 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-slate-400 h-12 pl-6">Informasi Pengguna</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12">Role / Jabatan</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12">Status Akun</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 h-12">Aktivitas Terakhir</TableHead>
                <TableHead className="text-right text-xs font-bold text-slate-400 h-12 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.user.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 rounded-lg border-white shadow-sm ring-0 group-hover:ring-[#66B21D]/20 transition-all">
                        <AvatarImage src={`/images/avatar.png`} alt={item.user.name ?? ""} />
                        <AvatarFallback className="bg-slate-50 text-slate-300 font-bold text-xs">{item.user.name?.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{item.user.name}</span>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Mail className="h-3 w-3" />
                          <span className="text-[10px] font-bold truncate max-w-[150px]">{item.user.email}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                         <Shield className="h-3 w-3" />
                      </div>
                      {type === "staff" ? (
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                          {item.role ? item.role : "Staff"}
                        </span>
                      ) : (
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Customer</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge className={`border-none text-[9px] font-black uppercase tracking-widest h-5 ${
                      item.user.status.toLowerCase() === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {item.user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                       <Clock className="h-3 w-3" />
                       <span className="text-[11px] font-bold">
                        {item.user.lastLogin ? new Date(item.user.lastLogin).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-[#66B21D] hover:border-green-100 hover:bg-green-50 transition-all">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="size-8 rounded-lg border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="size-8 rounded-lg border-slate-100 text-slate-400 hover:bg-slate-50 transition-all">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-2 w-48">
                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 p-2">Sesi Pengguna</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-lg text-xs font-bold p-2.5 focus:bg-slate-50 cursor-pointer text-slate-600">Lihat Aktivitas</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg text-xs font-bold p-2.5 focus:bg-slate-50 cursor-pointer text-slate-600">Reset Password</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center">
                       <div className="size-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 text-slate-200">
                         <User className="h-8 w-8" />
                       </div>
                       <p className="text-xs font-bold text-slate-400">Tidak ada data ditemukan</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
    </div>
  )
}
