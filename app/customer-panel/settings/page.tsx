import { db } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/session"
import { CustomerProfileForm } from "@/components/customer-profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, MapPin, ShieldCheck, Smartphone, Mail } from "lucide-react"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const current = await getCurrentUser()
  if (!current.isAuthenticated || current.type !== "customer") {
    redirect("/login")
  }

  const user = await db.users.findUnique({
    where: { uuid: current.id },
    select: {
      name: true,
      email: true,
      customerProfile: { select: { no_telp: true, provinsi: true, alamat: true } },
    },
  })

  if (!user || !user.customerProfile) {
    redirect("/login")
  }

  const customer = {
    name: user.name,
    email: user.email,
    no_telp: user.customerProfile.no_telp,
    provinsi: user.customerProfile.provinsi,
    alamat: user.customerProfile.alamat,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Profil</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">Kelola informasi diri, alamat pengiriman, dan keamanan akun Anda.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] shadow-sm">
          <TabsTrigger value="profile" className="gap-2 text-xs sm:text-sm">
            <User className="h-3.5 w-3.5" /> Profil & Alamat
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs sm:text-sm">
            <Lock className="h-3.5 w-3.5" /> Keamanan Akun
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="shadow-sm border-muted overflow-hidden py-0 gap-0">
            <CardHeader className="bg-muted/30 border-b py-4 pt-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Informasi Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               <CustomerProfileForm initialValues={customer} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="shadow-sm border-muted py-0 gap-0">
            <CardHeader className="bg-muted/30 border-b py-4 pt-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Keamanan & Login
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-10 text-center space-y-4">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-muted-foreground/30">
                <Lock className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Fitur Segera Hadir</p>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Modul ubah kata sandi dan autentikasi dua faktor (2FA) sedang dalam pengembangan.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted py-0 gap-0">
            <CardHeader className="bg-muted/30 border-b py-4 pt-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> Info Akun Terhubung
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-muted">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">Email Terdaftar</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold">TERVERIFIKASI</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">Nomor WhatsApp</p>
                    <p className="text-xs text-muted-foreground">{user.customerProfile?.no_telp || "-"}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold">AKTIF</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
