import { UserListTable } from "@/components/dashboard/user-list-table"
import { db } from "@/lib/db"
import { Card } from "@/components/ui/card"
import { StaffManagementHeader } from "@/components/dashboard/staff-management-header"
import { LayananAlertHandler } from "@/components/dashboard/layanan-alert-handler"

export default async function StaffListPage() {
  const users = await db.staffProfile.findMany({
    include: { 
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          lastLogin: true,
          image: true,
          createdAt: true
        }
      } 
    },
    orderBy: { user: { createdAt: "desc" } },
  })

  return (
    <div className="space-y-8 animate-fade-in relative">
      <LayananAlertHandler />
      
      <StaffManagementHeader />

      <Card className="border-0 shadow-none overflow-hidden bg-white rounded-2xl">
        <UserListTable data={users} type="staff" />
      </Card>
    </div>
  )
}
