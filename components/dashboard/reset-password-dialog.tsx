"use client"

import { useState } from "react"
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
import { resetUserPassword } from "@/app/actions/admin-actions"
import { KeyRound, Loader2, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { triggerLayananAlert } from "./layanan-alert-handler"

const formSchema = z.object({
  password: z.string().min(8, {
    message: "Password minimal 8 karakter.",
  }),
})

interface ResetPasswordDialogProps {
  user: {
    id: string
    name: string
    email: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResetPasswordDialog({ user, open, onOpenChange }: ResetPasswordDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const res = await resetUserPassword(user.id, values.password)
      if (res?.success) {
        onOpenChange(false)
        triggerLayananAlert(`Password untuk ${user.name} berhasil direset`)
        form.reset()
      } else {
        triggerLayananAlert(res?.message || "Gagal mereset password", "error")
      }
    } catch (error) {
      triggerLayananAlert("Terjadi kesalahan sistem", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
        <div className="bg-amber-50 px-8 py-8 border-b border-amber-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] rotate-12">
             <KeyRound className="size-24" />
          </div>
          <DialogHeader className="relative z-10">
            <div className="size-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-amber-200">
               <ShieldAlert className="size-6" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
              Atur ulang kata sandi untuk akun <span className="text-amber-600 font-bold">{user.name}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <KeyRound className="size-3" /> Password Baru
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Minimal 8 karakter" 
                        {...field} 
                        className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-amber-500 font-medium text-slate-900"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
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
                    loading ? "bg-slate-100 text-slate-400" : "bg-amber-500 hover:bg-amber-600 shadow-amber-100"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Memperbarui...
                    </div>
                  ) : (
                    "Reset Password Sekarang"
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
