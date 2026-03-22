import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"
import { Settings, User, Bell, Shield, Database, Layout, Mail, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function PengaturanPage() {
  const sections = [
    {
      id: "general",
      title: "Umum",
      description: "Pengaturan dasar aplikasi.",
      icon: Layout,
      fields: [
        { label: "Nama Aplikasi", value: "Tiamac AC Service", type: "text" },
        { label: "Email Support", value: "support@tiamac.com", type: "email" },
        { label: "Nomor WhatsApp", value: "0812-3456-7890", type: "text" }
      ]
    },
    {
      id: "notifications",
      title: "Notifikasi",
      description: "Atur cara Anda menerima notifikasi.",
      icon: Bell,
      fields: [
        { label: "Email Notifikasi", value: true, type: "switch" },
        { label: "WhatsApp Notifikasi", value: true, type: "switch" },
        { label: "Notifikasi Stok Menipis", value: true, type: "switch" }
      ]
    },
    {
      id: "security",
      title: "Keamanan",
      description: "Kelola kata sandi dan akses.",
      icon: Shield,
      fields: [
        { label: "Two-Factor Authentication", value: false, type: "switch" },
        { label: "Auto Logout (menit)", value: "30", type: "text" }
      ]
    }
  ]

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="space-y-4">
        <DynamicBreadcrumbs />
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Pengaturan Sistem</h1>
          <p className="text-slate-500 font-medium text-base">Sesuaikan preferensi aplikasi, notifikasi, dan keamanan akun Anda.</p>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.id} className="rounded-2xl border-0 shadow-none bg-white overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4 space-y-0 p-6 border-b border-slate-50/50">
              <div className="p-3 rounded-xl bg-slate-50 text-slate-400">
                <section.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900">{section.title}</CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500 mt-1">{section.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {section.fields.map((field, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <Label className="flex-1 text-sm font-bold text-slate-700">{field.label}</Label>
                  {field.type === "switch" ? (
                    <Switch checked={field.value as boolean} className="data-[state=checked]:bg-[#66B21D]" />
                  ) : (
                    <Input
                      type={field.type}
                      defaultValue={field.value as string}
                      className="w-full sm:max-w-[300px] h-10 text-sm font-medium border-slate-200 rounded-xl focus-visible:ring-[#66B21D] shadow-none bg-slate-50/50"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end gap-3 pt-6 pb-12">
          <Button variant="outline" className="h-11 px-6 rounded-xl text-xs font-bold border-slate-200 text-slate-500 hover:text-slate-900 transition-all shadow-none">Batalkan</Button>
          <Button className="h-11 px-6 rounded-xl bg-[#66B21D] hover:bg-[#4d9e0f] text-white font-black text-xs border-none shadow-none transition-all active:scale-95">Simpan Perubahan</Button>
        </div>
      </div>
    </div>
  )
}
