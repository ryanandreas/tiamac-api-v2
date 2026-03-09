import ProfileContent from "@/components/profile-page/components/profile-content"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"

export default function ProfilePage() {
  return (
    <SidebarInset>
      <DashboardHeader title="Profile" />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        </div>
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
          <ProfileContent />
        </div>
      </div>
    </SidebarInset>
  )
}
