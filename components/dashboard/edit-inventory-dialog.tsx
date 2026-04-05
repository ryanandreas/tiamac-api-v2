"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { updateInventoryItem } from "@/app/actions/admin-actions"
import { useRouter } from "next/navigation"
import { Edit3, Tag, Boxes, BadgeDollarSign, Loader2, ListOrdered, BarChart3, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { triggerLayananAlert } from "./layanan-alert-handler"

const formSchema = z.object({
  sku: z.string().min(2, {
    message: "SKU minimal 2 karakter.",
  }),
  nama: z.string().min(2, {
    message: "Nama barang minimal 2 karakter.",
  }),
  uom: z.string().min(1, {
    message: "Pilih satuan (UOM).",
  }),
  harga: z.coerce.number().min(0, {
    message: "Harga tidak boleh negatif.",
  }),
  qtyOnHand: z.coerce.number().min(0, {
    message: "Stok tidak boleh negatif.",
  }),
  minStock: z.coerce.number().min(0).optional(),
})

interface EditInventoryDialogProps {
  item: {
    id: string
    sku: string
    nama: string
    uom: string
    harga: number
    qtyOnHand: number
    minStock: number | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditInventoryDialog({ item, open, onOpenChange }: EditInventoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: item.sku,
      nama: item.nama,
      uom: item.uom,
      harga: item.harga,
      qtyOnHand: item.qtyOnHand,
      minStock: item.minStock || 0,
    },
  })

  // Update default values when item changes
  useEffect(() => {
    if (open) {
      form.reset({
        sku: item.sku,
        nama: item.nama,
        uom: item.uom,
        harga: item.harga,
        qtyOnHand: item.qtyOnHand,
        minStock: item.minStock || 0,
      })
    }
  }, [item, open, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const res = await updateInventoryItem(item.id, values as any)
      if (res?.success) {
        onOpenChange(false)
        router.refresh()
        triggerLayananAlert("Data barang berhasil diperbarui")
      } else {
        triggerLayananAlert(res?.message || "Gagal memperbarui data barang", "error")
      }
    } catch (error) {
      triggerLayananAlert("Terjadi kesalahan sistem saat menyimpan", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
        <div className="bg-slate-50 px-8 py-8 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
             <Settings2 className="size-32" />
          </div>
          <DialogHeader className="relative z-10">
            <div className="size-12 rounded-2xl bg-[#66B21D] text-white flex items-center justify-center mb-4 shadow-lg shadow-green-200">
               <Edit3 className="size-6" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Edit Data Barang</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
              Perbarui informasi SKU, harga, atau stok untuk barang ini.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                       <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Tag className="size-3" /> SKU / Kode
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="FREON-R32" 
                          {...field} 
                          className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-[#66B21D] font-medium text-slate-900"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uom"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                       <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Boxes className="size-3" /> Satuan (UOM)
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none focus:ring-[#66B21D] font-bold text-slate-900">
                            <SelectValue placeholder="Pilih Satuan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="pcs">Pcs / Buah</SelectItem>
                          <SelectItem value="meter">Meter</SelectItem>
                          <SelectItem value="set">Set / Pasang</SelectItem>
                          <SelectItem value="btg">Batang</SelectItem>
                          <SelectItem value="roll">Roll</SelectItem>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="liter">Liter</SelectItem>
                          <SelectItem value="tabung">Tabung / Unit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                     <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Edit3 className="size-3" /> Nama Barang
                      </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nama Barang" 
                        {...field} 
                        className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-[#66B21D] font-medium text-slate-900"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="harga"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                       <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <BadgeDollarSign className="size-3" /> Harga Jual (Rp)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rp</span>
                          <Input 
                            type="number" 
                            {...field} 
                            className="h-12 pl-10 rounded-xl bg-slate-50 border-none focus-visible:ring-[#66B21D] font-bold text-slate-900"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="qtyOnHand"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                         <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <ListOrdered className="size-3" /> Stok
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-[#66B21D] font-bold text-slate-900"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                         <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <BarChart3 className="size-3" /> Min
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-[#66B21D] font-bold text-slate-900"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-12 rounded-xl font-bold text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all border border-slate-100"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className={cn(
                    "flex-[2] h-12 rounded-xl font-bold text-xs text-white shadow-xl transition-all active:scale-95",
                    loading ? "bg-slate-100 text-slate-400" : "bg-[#66B21D] hover:bg-[#4d9e0f] shadow-green-100"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Menyimpan...
                    </div>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
