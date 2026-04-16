import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const service = await prisma.services.findFirst({
    // @ts-ignore - UUID fields do not support endsWith in Prisma, but it's used here for a partial ID check
    where: { id: { contains: '8794a8e5' } },
    include: { teknisi: true }
  });
  console.log(JSON.stringify(service, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
