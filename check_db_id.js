import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const serviceId = '5A5AAC2C'
  const service = await prisma.services.findFirst({
    where: {
      id: {
        contains: serviceId,
        mode: 'insensitive'
      }
    },
    include: {
      customer: {
        include: {
          customerProfile: true
        }
      }
    }
  })

  if (service) {
    console.log('RESULT_JSON:', JSON.stringify(service, null, 2))
  } else {
    console.log('Service not found')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
