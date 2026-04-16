import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const data = await prisma.acServiceCatalog.findMany({
    orderBy: { nama: 'asc' }
  });
  
  console.log('| Nama | PK | Harga |');
  console.log('| :--- | :--- | :--- |');
  data.forEach(item => {
    console.log(`| ${item.nama} | ${item.pk || '-'} | ${item.harga} |`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
