import ProfileContent from "@/components/profile-page/components/profile-content"
import { getCurrentUser } from "@/app/actions/session"
import { DynamicBreadcrumbs } from "@/components/dashboard/dynamic-breadcrumbs"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <DynamicBreadcrumbs />
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Profil Pengguna</h1>
            <p className="text-slate-500 font-medium text-base">Kelola informasi pribadi dan pengaturan keamanan akun Anda.</p>
          </div>
        </div>
      </div>

      <ProfileContent user={user} />
    </div>
  )
}
