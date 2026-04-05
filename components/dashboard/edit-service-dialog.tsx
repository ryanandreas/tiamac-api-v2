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
import { updateServiceCatalog } from "@/app/actions/admin-actions"
import { useRouter } from "next/navigation"
import { Settings2, Tag, Info, BadgeDollarSign, Loader2, Edit3, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { triggerLayananAlert } from "./layanan-alert-handler"

const formSchema = z.object({
  nama: z.string().min(2, {
    message: "Nama layanan minimal 2 karakter.",
  }),
  pk: z.string().optional(),
  harga: z.coerce.number().min(0, {
    message: "Harga tidak boleh negatif.",
  }),
})

interface EditServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: {
    uuid: string
    nama: string
    pk: string | null
    harga: number
  } | null
}

export function EditServiceDialog({ open, onOpenChange, service }: EditServiceDialogProps) {
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

  // Sync form values when service changes
  useEffect(() => {
    if (service) {
      form.reset({
        nama: service.nama,
        pk: service.pk || "-",
        harga: service.harga,
      })
    }
  }, [service, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!service) return
    
    setLoading(true)
    try {
      const res = await updateServiceCatalog(service.uuid, values as any)
      if (res?.success) {
        onOpenChange(false)
        router.refresh()
        triggerLayananAlert("Layanan berhasil diperbarui")
      } else {
        triggerLayananAlert(res?.message || "Gagal memperbarui layanan", "error")
      }
    } catch (error) {
      triggerLayananAlert("Terjadi kesalahan sistem saat menyimpan", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
        <div className="bg-slate-50 px-8 py-8 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
             <Settings2 className="size-32" />
          </div>
          <DialogHeader className="relative z-10">
            <div className="size-12 rounded-2xl bg-[#66B21D] text-white flex items-center justify-center mb-4 shadow-lg shadow-green-200">
               <Edit3 className="size-6" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Edit Layanan</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
              Perbarui detail layanan katalog Anda.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="nama"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Tag className="size-3" /> Nama Layanan
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nama Layanan" 
                          {...field} 
                          className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-[#66B21D] font-medium text-slate-900"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="pk"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Info className="size-3" /> Kapasitas (PK)
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none focus:ring-[#66B21D] font-medium text-slate-900 w-full px-4 text-left">
                              <SelectValue placeholder="Pilih PK" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-slate-100">
                            <SelectItem value="-">Semua PK (Flat Price)</SelectItem>
                            <SelectItem value="0.5">0.5 PK</SelectItem>
                            <SelectItem value="1">1 PK</SelectItem>
                            <SelectItem value="1.5-2">1.5 - 2 PK</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="harga"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <BadgeDollarSign className="size-3" /> Harga Dasar (Rp)
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
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-12 rounded-xl font-bold text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
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
