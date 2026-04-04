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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createInventoryItem } from "@/app/actions/admin-actions"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  sku: z.string().min(3, {
    message: "SKU minimal 3 karakter.",
  }),
  nama: z.string().min(2, {
    message: "Nama barang minimal 2 karakter.",
  }),
  uom: z.enum(["pcs", "meter", "botol", "tabung"]),
  harga: z.coerce.number().min(0),
  qtyOnHand: z.coerce.number().min(0),
  minStock: z.coerce.number().min(0).optional(),
})

interface AddInventoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddInventoryDialog({ open, onOpenChange }: AddInventoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      nama: "",
      uom: "pcs",
      harga: 0,
      qtyOnHand: 0,
      minStock: 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const res = await createInventoryItem(values as any)
      if (res?.success) {
        alert(res.message)
        onOpenChange(false)
        router.refresh()
        form.reset()
      } else {
        alert(res?.message || "Gagal menambahkan barang")
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
          <DialogTitle>Tambah Barang Baru</DialogTitle>
          <DialogDescription>
            Input detail material atau sparepart baru ke dalam stok gudang.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="BRG-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="uom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan (UOM)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih satuan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pcs">Pcs</SelectItem>
                        <SelectItem value="meter">Meter</SelectItem>
                        <SelectItem value="botol">Botol</SelectItem>
                        <SelectItem value="tabung">Tabung</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Barang</FormLabel>
                  <FormControl>
                    <Input placeholder="Freon R32, Pipa 1/4, dsb." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="harga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Jual (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="qtyOnHand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Awal</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="minStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimal Stok (Peringatan)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6">
              <Button type="submit" className="w-full bg-[#66B21D] hover:bg-[#4d9e0f]" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Barang"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
