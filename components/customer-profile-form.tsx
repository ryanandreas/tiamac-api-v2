"use client"

import * as React from "react"
import { useActionState } from "react"
import { updateCustomerProfile } from "@/app/actions/customer"
import type { CustomerProfileActionState } from "@/app/actions/customer"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"

export function CustomerProfileForm({
  initialValues,
}: {
  initialValues: {
    name: string
    email: string
    no_telp: string
    provinsi?: string | null
    alamat?: string | null
  }
}) {
  const [state, formAction, isPending] = useActionState<CustomerProfileActionState, FormData>(
    updateCustomerProfile,
    null
  )

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && (
        <div className="text-sm font-bold text-[#66B21D] bg-green-50/50 p-4 rounded-2xl border-none animate-fade-in">{state.message}</div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5 px-0">
          <Label htmlFor="name" className="text-xs font-bold text-slate-400 pl-1">Nama Lengkap</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialValues.name}
            required
            className="h-11 px-4 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-300"
          />
        </div>
        <div className="space-y-1.5 px-0">
          <Label htmlFor="email" className="text-xs font-bold text-slate-400 pl-1">Alamat Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initialValues.email}
            required
            className="h-11 px-4 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-300"
          />
        </div>
        <div className="space-y-1.5 px-0">
          <Label htmlFor="no_telp" className="text-xs font-bold text-slate-400 pl-1">No. Telp / WhatsApp</Label>
          <Input
            id="no_telp"
            name="no_telp"
            defaultValue={initialValues.no_telp}
            required
            className="h-11 px-4 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-300"
          />
        </div>
        <div className="space-y-1.5 px-0">
          <Label htmlFor="provinsi" className="text-xs font-bold text-slate-400 pl-1">Provinsi</Label>
          <Input
            id="provinsi"
            name="provinsi"
            defaultValue={initialValues.provinsi ?? ""}
            className="h-11 px-4 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-300"
          />
        </div>
      </div>
      <div className="space-y-1.5 px-0">
        <Label htmlFor="alamat" className="text-xs font-bold text-slate-400 pl-1">Alamat Lengkap</Label>
        <Textarea
          id="alamat"
          name="alamat"
          defaultValue={initialValues.alamat ?? ""}
          rows={3}
          className="p-4 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm text-slate-900 resize-none placeholder:text-slate-300"
        />
      </div>
      <div className="space-y-1.5 px-0">
        <Label htmlFor="password" className="text-xs font-bold text-slate-400 pl-1">Ubah Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="•••••••• (Kosongkan jika tidak diubah)"
          className="h-11 px-4 bg-slate-50 border-none shadow-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#66B21D] focus-visible:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-300"
        />
      </div>
      <div className="flex items-center justify-start pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 px-8 rounded-2xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-bold text-xs shadow-none gap-2 transition-all"
        >
          {isPending ? "Menyimpan..." : (
            <>
              <Save className="size-4" /> Simpan Perubahan
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
