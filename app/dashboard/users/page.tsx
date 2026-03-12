import { UserListTable } from "@/components/dashboard/user-list-table"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { db } from "@/lib/db"

export default async function StaffListPage() {
  const users = await db.staffProfile.findMany({
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } },
  })

  return (
    <SidebarInset>
      <DashboardHeader title="List Staff" />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Staff List</h2>
        </div>
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <p className="text-muted-foreground">
                Manage your staff members and their roles.
              </p>
            </div>
          </div>
          <UserListTable data={users} type="staff" />
        </div>
      </div>
    </SidebarInset>
  )
}
