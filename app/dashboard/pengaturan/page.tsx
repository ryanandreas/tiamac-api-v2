import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
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
    <SidebarInset>
      <DashboardHeader title="Pengaturan Sistem" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4 max-w-4xl">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-bold tracking-tight">Pengaturan</h2>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-2 rounded-lg bg-muted">
                  <section.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields.map((field, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <Label className="flex-1">{field.label}</Label>
                    {field.type === "switch" ? (
                      <Switch checked={field.value as boolean} />
                    ) : (
                      <Input
                        type={field.type}
                        defaultValue={field.value as string}
                        className="max-w-[250px]"
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-end gap-2 py-4">
            <Button variant="outline">Batalkan</Button>
            <Button>Simpan Perubahan</Button>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}
