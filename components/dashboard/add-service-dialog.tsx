"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createServiceCatalog } from "@/app/actions/admin-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  nama: z.string().min(2, {
    message: "Nama layanan minimal 2 karakter.",
  }),
  pk: z.string().optional(),
  harga: z.coerce.number().min(0, {
    message: "Harga tidak boleh negatif.",
  }),
})

interface AddServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddServiceDialog({ open, onOpenChange }: AddServiceDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      pk: "",
      harga: 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const res = await createServiceCatalog(values)
      if (res?.success) {
        // toast.success(res.message) // Removed sonner check earlier, using alert for now
        alert(res.message)
        onOpenChange(false)
        router.refresh()
        form.reset()
      } else {
        alert(res?.message || "Gagal menambahkan layanan")
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Layanan Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail layanan baru untuk ditambahkan ke katalog.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Layanan</FormLabel>
                  <FormControl>
                    <Input placeholder="Cuci AC, Bongkar Pasang, dsb." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PK / Kapasitas (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="0.5, 1, 1.5, 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="harga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga Dasar (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full bg-[#66B21D] hover:bg-[#4d9e0f]" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Layanan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
