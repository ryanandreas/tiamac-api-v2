import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Calendar, Mail, MapPin } from "lucide-react";
import type { CurrentUser } from "@/app/actions/session";

export default function ProfileHeader({ user }: { user: CurrentUser }) {
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

  return (
    <Card className="rounded-[32px] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white/70 backdrop-blur-md">
      <CardContent className="p-8">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
          <div className="relative group">
            <div className="size-28 rounded-[28px] overflow-hidden border-4 border-white shadow-2xl ring-1 ring-slate-100">
              <Avatar className="h-full w-full rounded-none">
                {user.image && <AvatarImage src={user.image} alt={user.name || ""} />}
                <AvatarFallback className="text-3xl font-black bg-[#66B21D]/10 text-[#66B21D]">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button
              size="icon"
              variant="outline"
              className="absolute -right-2 -bottom-2 h-10 w-10 rounded-2xl bg-white border-2 border-white shadow-xl hover:bg-slate-50 transition-all hover:scale-110 active:scale-95 text-[#66B21D]">
              <Camera className="size-5" />
            </Button>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
              <Badge variant="secondary" className="w-fit px-3 py-1 bg-[#66B21D]/10 text-[#66B21D] border-none text-[10px] font-black uppercase tracking-wider rounded-lg">
                {staff?.role || "Staff"}
              </Badge>
            </div>
            <p className="text-slate-500 font-bold text-sm">
              {profile.bio || "Staff Profesional Tiamac Service"}
            </p>
            <div className="text-slate-400 flex flex-wrap gap-6 text-[13px] font-bold">
              <div className="flex items-center gap-2 group transition-colors hover:text-[#66B21D]">
                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-[#66B21D]/10 text-slate-300 group-hover:text-[#66B21D] transition-all">
                  <Mail className="size-4" />
                </div>
                {user.email}
              </div>
              <div className="flex items-center gap-2 group transition-colors hover:text-[#66B21D]">
                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-[#66B21D]/10 text-slate-300 group-hover:text-[#66B21D] transition-all">
                  <MapPin className="size-4" />
                </div>
                {profile.wilayah || "Wilayah Belum Diatur"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
