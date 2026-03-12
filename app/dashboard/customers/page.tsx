import { UserListTable } from "@/components/dashboard/user-list-table"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset } from "@/components/ui/sidebar"
import { db } from "@/lib/db"

export default async function CustomerListPage() {
  const customers = await db.customerProfile.findMany({
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } },
  })

  return (
    <SidebarInset>
      <DashboardHeader title="List Customer" />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Customer List</h2>
        </div>
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <p className="text-muted-foreground">
                Manage your customers and their contact information.
              </p>
            </div>
          </div>
          <UserListTable data={customers} type="customer" />
        </div>
      </div>
    </SidebarInset>
  )
}
