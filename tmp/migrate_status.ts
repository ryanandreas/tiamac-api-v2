import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Memulai migrasi status 'Teknisi Dikonfirmasi' ke 'Konfirmasi Teknisi'...");

  // Update Services table
  const updateServices = await prisma.services.updateMany({
    where: {
      OR: [
        { status: "Teknisi Dikonfirmasi" },
        { status_servis: "Teknisi Dikonfirmasi" }
      ]
    },
    data: {
      status: "Konfirmasi Teknisi",
      status_servis: "Konfirmasi Teknisi"
    }
  });
  console.log(`Berhasil memperbarui ${updateServices.count} record di tabel Services.`);

  // Update ServiceStatusHistory table
  const updateHistory = await prisma.serviceStatusHistory.updateMany({
    where: {
      OR: [
        { status: "Teknisi Dikonfirmasi" },
        { status_servis: "Teknisi Dikonfirmasi" }
      ]
    },
    data: {
      status: "Konfirmasi Teknisi",
      status_servis: "Konfirmasi Teknisi"
    }
  });
  console.log(`Berhasil memperbarui ${updateHistory.count} record di tabel ServiceStatusHistory.`);
}

main()
  .catch(e => {
    console.error("Gagal melakukan migrasi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
