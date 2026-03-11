"use client"

import * as React from "react"
import { useActionState } from "react"
import { updateCustomerProfile } from "@/app/actions/customer"
import type { CustomerProfileActionState } from "@/app/actions/customer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
    <Card>
      <CardHeader>
        <CardTitle>Profil Customer</CardTitle>
        <CardDescription>Perbarui data profil Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.message && (
            <div className="text-sm font-medium text-muted-foreground">{state.message}</div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" name="name" defaultValue={initialValues.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={initialValues.email} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="no_telp">No. Telp</Label>
              <Input id="no_telp" name="no_telp" defaultValue={initialValues.no_telp} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provinsi">Provinsi</Label>
              <Input id="provinsi" name="provinsi" defaultValue={initialValues.provinsi ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea id="alamat" name="alamat" defaultValue={initialValues.alamat ?? ""} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <Input id="password" name="password" type="password" placeholder="Kosongkan jika tidak ingin mengubah" />
          </div>
          <div className="flex items-center justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

