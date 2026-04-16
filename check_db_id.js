
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkIds() {
  const services = await prisma.services.findMany({ take: 5 })
  console.log('Services IDs:', services.map(s => s.id))
  process.exit(0)
}

checkIds()
