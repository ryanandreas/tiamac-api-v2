import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning up database for "Perbaikan Unit" ---');
  
  const services = await prisma.services.updateMany({
    where: { status_servis: 'Sedang Dikerjakan' },
    data: { 
      status: 'Perbaikan Unit',
      status_servis: 'Perbaikan Unit'
    }
  });
  console.log(`Updated ${services.count} Services records.`);

  const history = await prisma.serviceStatusHistory.updateMany({
    where: { status_servis: 'Sedang Dikerjakan' },
    data: { 
      status: 'Perbaikan Unit',
      status_servis: 'Perbaikan Unit'
    }
  });
  console.log(`Updated ${history.count} History records.`);

  console.log('--- Migration Complete ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
