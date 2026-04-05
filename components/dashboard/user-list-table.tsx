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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Shield, Clock, Filter, UserCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Prisma } from "@prisma/client"
import { UserActions } from "./user-actions"

type UserListTableProps =
  | {
      type: "staff"
      data: any[]
    }
  | {
      type: "customer"
      data: any[]
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
            <Button variant="outline" size="icon" className="h-10 w-10 border-slate-100 rounded-xl text-slate-400 hover:text-[#66B21D] hover:bg-green-50 transition-all shadow-none">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/10">
              <TableRow className="border-slate-50 hover:bg-transparent">
                <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest h-12 pl-6">Informasi</TableHead>
                <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest h-12">Role / Hak Akses</TableHead>
                <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest h-12">Status</TableHead>
                <TableHead className="text-xs font-black text-slate-400 uppercase tracking-widest h-12">Login Terakhir</TableHead>
                <TableHead className="text-right text-xs font-black text-slate-400 uppercase tracking-widest h-12 pr-6">Alat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
                const userObj = item.user;
                const combinedUser = {
                  ...userObj,
                  staffProfile: type === "staff" ? item : null
                };

                return (
                  <TableRow key={userObj.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 rounded-lg border-white shadow-sm ring-0 group-hover:ring-[#66B21D]/20 transition-all">
                          <AvatarImage src={userObj.image || `/images/avatar.png`} alt={userObj.name ?? ""} />
                          <AvatarFallback className="bg-slate-50 text-slate-300 font-bold text-xs">{userObj.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 leading-none mb-1">{userObj.name}</span>
                          <div className="flex items-center gap-1.5 text-slate-400 leading-none">
                            <Mail className="h-3 w-3" />
                            <span className="text-[10px] font-bold truncate max-w-[150px] tracking-tight">{userObj.email}</span>
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
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                            {item.role || "Staff"}
                          </span>
                        ) : (
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest text-[#66B21D]">Pelanggan</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={cn(
                        "border-none text-[9px] font-black uppercase tracking-widest h-5 px-3",
                        userObj.status.toLowerCase() === 'active' 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-rose-50 text-rose-600'
                      )}>
                        {userObj.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-slate-400">
                         <Clock className="h-3 w-3" />
                         <span className="text-[11px] font-bold">
                          {userObj.lastLogin ? new Date(userObj.lastLogin).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6">
                      {type === "staff" ? (
                        <UserActions user={combinedUser} />
                      ) : (
                         <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Customer Only</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center">
                       <div className="size-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 text-slate-200">
                          <UserCircle2 className="h-8 w-8" />
                       </div>
                       <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tidak ada data ditemukan</p>
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
