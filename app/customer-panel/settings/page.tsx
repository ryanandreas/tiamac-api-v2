import type { Metadata } from "next"
import { getCurrentUser } from "@/app/actions/session"
import { CustomerProfileForm } from "@/components/customer-profile-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, MapPin, ShieldCheck, Smartphone, Mail } from "lucide-react"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Pengaturan Profil",
}

export default async function SettingsPage() {
  const current = await getCurrentUser()
  if (!current.isAuthenticated || current.type !== "customer") {
    redirect("/login")
  }

  const customer = {
    name: current.name ?? "",
    email: current.email ?? "",
    no_telp: current.profile?.no_telp ?? "",
    provinsi: current.profile?.provinsi ?? "",
    alamat: current.profile?.alamat ?? "",
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white px-6 py-4 rounded-3xl flex flex-col gap-1 border-none shadow-none">
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Pengaturan Profil</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Kelola informasi diri, alamat pengiriman, dan keamanan akun Anda.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex w-full max-w-md bg-white p-1 rounded-2xl h-12 shadow-none border-none mb-2">
          <TabsTrigger value="profile" className="flex-1 rounded-xl font-semibold text-sm data-[state=active]:bg-green-50 data-[state=active]:text-[#66B21D] data-[state=active]:shadow-none transition-all gap-2">
            <User className="h-4 w-4" /> Profil & Alamat
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 rounded-xl font-semibold text-sm data-[state=active]:bg-green-50 data-[state=active]:text-[#66B21D] data-[state=active]:shadow-none transition-all gap-2">
            <Lock className="h-4 w-4" /> Keamanan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <Card className="shadow-none border-none overflow-hidden py-0 gap-0 bg-white">
            <CardHeader className="px-6 pt-5 pb-2 border-none">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-[#66B21D]" /> Informasi Pribadi
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">Pastikan data Anda tetap akurat untuk mempermudah pengerjaan teknisi.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
               <CustomerProfileForm initialValues={customer} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0 space-y-4">
          <Card className="shadow-none border-none py-0 gap-0 bg-white">
            <CardHeader className="px-6 pt-5 pb-2 border-none">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-[#66B21D]" /> Keamanan & Login
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">Kendalikan akses dan lapis keamanan akun Anda.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 pb-10 text-center space-y-4">
              <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border-none">
                <Lock className="h-8 w-8 text-slate-200" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Fitur Segera Hadir</p>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                  Modul ubah kata sandi dan autentikasi dua faktor (2FA) sedang dalam pengembangan.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-none py-0 gap-0 bg-white">
            <CardHeader className="px-6 pt-5 pb-2 border-none">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-[#66B21D]" /> Info Akun Terhubung
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">Detail kontak yang terverifikasi dalam sistem.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">Email Utama</p>
                    <p className="text-xs text-slate-400 font-medium">{customer.email}</p>
                  </div>
                </div>
                <Badge className="text-[9px] font-bold bg-green-50 text-[#66B21D] border-none px-2 h-5 rounded-lg">Terverifikasi</Badge>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">WhatsApp Aktif</p>
                    <p className="text-xs text-slate-400 font-medium">{customer.no_telp || "-"}</p>
                  </div>
                </div>
                <Badge className="text-[9px] font-bold bg-green-50 text-[#66B21D] border-none px-2 h-5 rounded-lg">Aktif</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
