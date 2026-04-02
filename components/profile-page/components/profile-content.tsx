'use client'

import { Shield, Key, Trash2, ArrowRight, MapPin, Mail, Phone, User as UserIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { CurrentUser } from "@/app/actions/session";
import { useState, useTransition, useEffect } from "react";
import { updateStaffProfile } from "@/app/actions/profile";

export default function ProfileContent({ user }: { user: CurrentUser }) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{ success: boolean; message: string } | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  if (!user.isAuthenticated) return null;

  const staff = user.type === "staff" ? user : null;
  const profile = staff?.profile || {};

  const getInitials = (name?: string) => {
    if (!name) return "??";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateStaffProfile(formData);
      setState(result);
      setShowAlert(true);
    });
  }

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 relative font-outfit">
      {/* Floating Alert */}
      {showAlert && state && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 animate-in fade-in slide-in-from-top-8 duration-500">
          <div className={`p-5 rounded-[24px] bg-white border ${state.success ? 'border-emerald-100 shadow-emerald-200/40 ring-emerald-50/50' : 'border-rose-100 shadow-rose-200/40 ring-rose-50/50'} flex items-center gap-4 shadow-2xl ring-4`}>
            <div className={`w-12 h-12 rounded-2xl ${state.success ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} flex items-center justify-center shrink-0`}>
              {state.success ? <CheckCircle2 className="size-6" /> : <AlertCircle className="size-6" />}
            </div>
            <div className="text-left flex-1">
              <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${state.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {state.success ? 'Berhasil' : 'Gagal'}
              </p>
              <p className="text-sm font-bold text-slate-700 leading-tight">
                {state.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="personal" className="space-y-8">
        {/* Modern Segmented Controller (Pill Style) */}
        <div className="flex justify-start px-2">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-[22px] h-auto gap-1 border border-slate-200/50 backdrop-blur-sm">
            <TabsTrigger 
              value="personal" 
              className="rounded-[18px] px-8 py-2.5 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-[#66B21D] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#66B21D]/20 transition-all duration-300"
            >
              Personal
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="rounded-[18px] px-8 py-2.5 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-[#66B21D] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#66B21D]/20 transition-all duration-300"
            >
              Keamanan
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="rounded-[18px] px-8 py-2.5 text-[11px] font-black uppercase tracking-widest data-[state=active]:bg-[#66B21D] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#66B21D]/20 transition-all duration-300"
            >
              Notifikasi
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Card Wrapper following /dashboard/tugas */}
        <div className="bg-white rounded-3xl border-0 shadow-none overflow-hidden pb-12">
          <div className="p-8">
            <TabsContent value="personal" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 m-0">
              <form action={handleSubmit} className="space-y-10">
                {/* Compact Profile Identity */}
                <div className="flex items-center gap-5 p-6 rounded-3xl bg-slate-50/50 border border-slate-100 shadow-sm shadow-slate-200/20">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border-2 border-white shadow-md flex items-center justify-center">
                    {user.image ? (
                      <img 
                        src={user.image} 
                        className="w-full h-full object-cover" 
                        alt="Avatar" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[#66B21D]/10 flex items-center justify-center text-[#66B21D] text-xl font-black">
                        {getInitials(user.name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black text-[#66B21D] uppercase tracking-wider px-1.5 py-0.5 bg-[#66B21D]/10 rounded-md">
                        {staff?.role || 'Staff'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="size-3" /> {profile.wilayah || 'Wilayah belum diatur'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Nama Lengkap */}
                  <div className="space-y-3 group">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1 group-focus-within:text-[#66B21D] transition-colors">Nama Lengkap</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors" />
                      <Input 
                        name="name"
                        defaultValue={user.name || ""} 
                        className="h-14 pl-11 bg-white border-2 border-slate-50 rounded-2xl focus-visible:ring-0 focus-visible:border-[#66B21D]/30 focus-visible:bg-white shadow-sm shadow-slate-100/50 transition-all font-bold text-slate-700" 
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-3 group">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1 group-focus-within:text-[#66B21D] transition-colors">Alamat Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors" />
                      <Input 
                        defaultValue={user.email || ""} 
                        disabled
                        className="h-14 pl-11 bg-slate-50 border-2 border-slate-50 rounded-2xl cursor-not-allowed font-bold text-slate-400" 
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-3 group">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1 group-focus-within:text-[#66B21D] transition-colors">Nomor WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors" />
                      <Input 
                        name="no_telp"
                        defaultValue={profile.no_telp || ""} 
                        placeholder="0812-..."
                        className="h-14 pl-11 bg-white border-2 border-slate-50 rounded-2xl focus-visible:ring-0 focus-visible:border-[#66B21D]/30 focus-visible:bg-white shadow-sm shadow-slate-100/50 transition-all font-bold text-slate-700" 
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-3 group">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1 group-focus-within:text-[#66B21D] transition-colors">Wilayah</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-[#66B21D] transition-colors" />
                      <Input 
                        name="wilayah"
                        defaultValue={profile.wilayah || ""} 
                        placeholder="Contoh: Jakarta Selatan"
                        className="h-14 pl-11 bg-white border-2 border-slate-50 rounded-2xl focus-visible:ring-0 focus-visible:border-[#66B21D]/30 focus-visible:bg-white shadow-sm shadow-slate-100/50 transition-all font-bold text-slate-700" 
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-3 group">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1 group-focus-within:text-[#66B21D] transition-colors">Bio</Label>
                  <Textarea 
                    name="bio"
                    defaultValue={profile.bio || ""} 
                    placeholder="Tuliskan sedikit tentang Anda..."
                    className="min-h-[120px] p-4 bg-white border-2 border-slate-50 rounded-2xl focus-visible:ring-0 focus-visible:border-[#66B21D]/30 focus-visible:bg-white shadow-sm shadow-slate-100/50 transition-all font-bold text-slate-600 line-height-relaxed" 
                  />
                </div>

                <div className="flex justify-end pt-6">
                  <Button 
                    type="submit"
                    disabled={isPending}
                    className="h-14 px-10 bg-[#66B21D] hover:bg-[#4d9e0f] text-white rounded-2xl font-black text-sm uppercase tracking-widest border-none shadow-xl shadow-[#66B21D]/20 transition-all hover:scale-[1.02] active:scale-95 gap-3 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Memproses...
                      </span>
                    ) : (
                      <>
                        <span>Simpan Profil</span>
                        <ArrowRight className="size-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="security" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-3xl bg-slate-50/50 border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#66B21D] shadow-sm">
                      <Key className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 tracking-tight">Kata Sandi</h3>
                      <p className="text-xs font-bold text-slate-400">Terakhir diubah 3 bulan yang lalu</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full h-12 rounded-xl font-bold text-slate-600 hover:bg-white border-slate-100 shadow-none">Ubah Sandi</Button>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50/50 border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#66B21D] shadow-sm">
                      <Shield className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 tracking-tight">Otentikasi 2 Faktor</h3>
                      <p className="text-xs font-bold text-[#66B21D]">Status: Aktif</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full h-12 rounded-xl font-bold text-slate-600 hover:bg-white border-slate-100 shadow-none">Konfigurasi</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 m-0">
              <div className="bg-slate-50/50 rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
                {[
                  { label: "Email Pesanan", desc: "Dapatkan email saat ada pesanan baru", active: true },
                  { label: "Notifikasi WA", desc: "Terima update status via WhatsApp", active: true },
                  { label: "Alert Stok", desc: "Peringatan saat stok inventory menipis", active: false }
                ].map((item, i) => (
                  <div key={i} className={`p-6 flex items-center justify-between ${i !== 2 ? 'border-b border-slate-100' : ''}`}>
                    <div className="space-y-1">
                      <Label className="text-[13px] font-black text-slate-900 tracking-tight">{item.label}</Label>
                      <p className="text-xs font-bold text-slate-400">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.active} className="data-[state=checked]:bg-[#66B21D]" />
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
