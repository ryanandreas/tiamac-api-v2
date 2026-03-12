import { db } from "./lib/db"

async function main() {
  try {
    const user = await db.users.findFirst({
      include: { staffProfile: true, customerProfile: true }
    })
    console.log("Found user:", user?.email)
    
    if (user) {
      const updated = await db.users.update({
        where: { uuid: user.uuid },
        data: { lastLogin: new Date() },
      })
      console.log("Update success, lastLogin:", updated.lastLogin)
    }
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await db.$disconnect()
  }
}

main()
