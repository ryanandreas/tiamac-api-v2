import { getCurrentUser } from "@/app/actions/session"
import {
  SidebarInset,
} from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function Page() {
  const user = await getCurrentUser()
  
  if (!user.isAuthenticated) return null

  return (
    <SidebarInset>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50 p-6 flex flex-col items-center justify-center">
             <h3 className="font-semibold">Welcome Back</h3>
             <p className="text-sm text-muted-foreground">{user.type === "staff" ? user.role : user.type}</p>
          </div>
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
           <p>Select an item from the sidebar to manage services.</p>
        </div>
      </div>
    </SidebarInset>
  )
}
