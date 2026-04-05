import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const service = await prisma.services.findFirst({
    where: { id: { endsWith: '8794a8e5' } },
    include: { teknisi: true }
  });
  console.log(JSON.stringify(service, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
