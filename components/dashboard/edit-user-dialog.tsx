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
import { updateStaffUser, updateCustomerUser } from "@/app/actions/admin-actions"
import { useRouter } from "next/navigation"
import { UserCog, Mail, ShieldCheck, Phone, MapPin, Loader2, UserCircle2, Settings2, Activity, Map } from "lucide-react"
import { cn } from "@/lib/utils"
import { triggerLayananAlert } from "./layanan-alert-handler"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nama minimal 2 karakter.",
  }),
  email: z.string().email({
    message: "Email tidak valid.",
  }),
  status: z.string(),
  role: z.string().optional(),
  no_telp: z.string().optional(),
  wilayah: z.string().optional(),
  bio: z.string().optional(),
  provinsi: z.string().optional(),
  alamat: z.string().optional(),
})

interface EditUserDialogProps {
  type?: "staff" | "customer"
  user: {
    id: string
    name: string
    email: string
    status: string
    staffProfile?: {
      role: string
      no_telp: string | null
      wilayah: string | null
      bio: string | null
    } | null
    customerProfile?: {
      no_telp: string | null
      alamat: string | null
      provinsi: string | null
    } | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange, type = "staff" }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.staffProfile?.role || "teknisi",
      no_telp: user.staffProfile?.no_telp || user.customerProfile?.no_telp || "",
      wilayah: user.staffProfile?.wilayah || "",
      bio: user.staffProfile?.bio || "",
      provinsi: user.customerProfile?.provinsi || "",
      alamat: user.customerProfile?.alamat || "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.staffProfile?.role || "teknisi",
        no_telp: user.staffProfile?.no_telp || user.customerProfile?.no_telp || "",
        wilayah: user.staffProfile?.wilayah || "",
        bio: user.staffProfile?.bio || "",
        provinsi: user.customerProfile?.provinsi || "",
        alamat: user.customerProfile?.alamat || "",
      })
    }
  }, [user, open, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const res = type === "staff" 
        ? await updateStaffUser(user.id, values as any)
        : await updateCustomerUser(user.id, values as any)

      if (res?.success) {
        onOpenChange(false)
        router.refresh()
        triggerLayananAlert("Perubahan profil berhasil disimpan")
      } else {
        triggerLayananAlert(res?.message || "Gagal memperbarui profil", "error")
      }
    } catch (error) {
      triggerLayananAlert("Terjadi kesalahan sistem", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
        <div className="bg-slate-50 px-8 py-8 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
             <Settings2 className="size-32" />
          </div>
          <DialogHeader className="relative z-10">
            <div className="size-12 rounded-2xl bg-[#66B21D] text-white flex items-center justify-center mb-4 shadow-lg shadow-green-200">
               <UserCog className="size-6" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              Edit Profil {type === "staff" ? "Staff" : "Pelanggan"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
              Perbarui informasi akses, peran, dan detail profil {type === "staff" ? "teknisi" : "pelanggan"}.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                       <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <UserCircle2 className="size-3" /> Nama Lengkap
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nama lengkap" 
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
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                       <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail className="size-3" /> Alamat Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="email@tiamac.com" 
                          {...field} 
                          className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-[#66B21D] font-medium text-slate-900"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                       <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="size-3" /> Status Akun
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none focus:ring-[#66B21D] font-bold text-slate-900">
                            <SelectValue placeholder="Pilih Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="ACTIVE">Aktif (Bisa Login)</SelectItem>
                          <SelectItem value="DISABLED">Nonaktif (Blokir Akses)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                {type === "staff" && (
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck className="size-3" /> Peran (Role)
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none focus:ring-[#66B21D] font-bold text-slate-900">
                              <SelectValue placeholder="Pilih Peran" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="teknisi">Teknisi / Lapangan</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                )}
                {type === "customer" && (
                  <FormField
                    control={form.control}
                    name="provinsi"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Map className="size-3" /> Provinsi
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Contoh: DKI Jakarta" 
                            {...field} 
                            className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-[#66B21D] font-medium text-slate-900"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="no_telp"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                       <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Phone className="size-3" /> Nomor Telepon
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0812xxxx" 
                          {...field} 
                          className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-[#66B21D] font-medium text-slate-900"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                {type === "staff" ? (
                  <FormField
                    control={form.control}
                    name="wilayah"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <MapPin className="size-3" /> Wilayah Tugas
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Contoh: Jakarta Timur" 
                            {...field} 
                            className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-[#66B21D] font-medium text-slate-900"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="alamat"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <MapPin className="size-3" /> Alamat Lengkap
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Jl. Contoh No. 123" 
                            {...field} 
                            className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-[#66B21D] font-medium text-slate-900"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                )}
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
