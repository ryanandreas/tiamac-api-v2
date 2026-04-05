"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { uploadBuktiServis } from "@/app/actions/teknisi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function BuktiUpload({
  serviceId,
  statusServis,
}: {
  serviceId: string
  statusServis: string
}) {
  const router = useRouter()
  const [before, setBefore] = useState<File | null>(null)
  const [after, setAfter] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit() {
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      if (!before || !after) {
        setError("Foto before dan after wajib diupload.")
        return
      }

      const res = await uploadBuktiServis({ serviceId, before, after })
      if (!res.success) {
        setError(res.message ?? "Gagal upload bukti.")
        return
      }
      setSuccess("Bukti berhasil disimpan.")
      router.push("/dashboard/pengerjaan")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Bukti Servis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">Status saat ini: {statusServis}</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <div className="text-sm font-medium">Foto Before</div>
            <Input
              type="file"
              accept="image/*"
              disabled={busy || statusServis !== "Perbaikan Unit"}
              onChange={(e) => setBefore(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Foto After</div>
            <Input
              type="file"
              accept="image/*"
              disabled={busy || statusServis !== "Perbaikan Unit"}
              onChange={(e) => setAfter(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        {error ? <div className="text-sm text-destructive">{error}</div> : null}
        {success ? <div className="text-sm text-primary">{success}</div> : null}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmit} disabled={busy || statusServis !== "Perbaikan Unit"}>
          Simpan & Tandai Selesai
        </Button>
      </CardFooter>
    </Card>
  )
}
