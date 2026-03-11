import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Users
  // Admin User
  const admin = await prisma.users.upsert({
    where: { email: 'admin@gmail.com' },
    update: { password: 'pass1234' },
    create: {
      uuid: 'a23b2e20-bdc9-407d-81d1-fca0d5e55c2c',
      name: 'ryan',
      email: 'admin@gmail.com',
      password: 'pass1234',
      role: 'admin',
    },
  })
  console.log('Upserted user:', admin.email)

  // Karyawan User
  const employee = await prisma.users.upsert({
    where: { email: 'john@gmail.com' },
    update: { password: 'pass1234' },
    create: {
      uuid: '86a9c744-4e7f-4dce-83c0-d06ce8860154',
      name: 'johndoe',
      email: 'john@gmail.com',
      password: 'pass1234',
      role: 'karyawan',
    },
  })
  console.log('Upserted user:', employee.email)

  // Customers
  // Customer 1
  const cust1 = await prisma.customers.upsert({
    where: { email: 'cust2@gmail.com' },
    update: { password: 'pass1234' },
    create: {
      uuid: 'dfb4f26f-252d-4690-8565-bdc59dde6ffc',
      name: 'cust1',
      email: 'cust2@gmail.com',
      password: 'pass1234',
      no_telp: '812341234',
      provinsi: 'Jakarta timur',
      alamat: 'Cengkareng, kapuk',
    },
  })
  console.log('Upserted customer:', cust1.email)

  // Customer 2
  const cust2 = await prisma.customers.upsert({
    where: { email: 'budi@gmail.com' },
    update: { password: 'pass1234' },
    create: {
      uuid: '3512ef7d-3cca-492a-a864-975566b8e4ae',
      name: 'Budi',
      email: 'budi@gmail.com',
      password: 'pass1234',
      no_telp: '1234567890',
      provinsi: 'Jakarta Barat',
      alamat: 'cdngkareng',
    },
  })
  console.log('Upserted customer:', cust2.email)

  await prisma.acServiceCatalog.createMany({
    data: [
      { nama: 'Cuci AC', pk: '0.5', harga: 75000 },
      { nama: 'Cuci AC', pk: '1', harga: 75000 },
      { nama: 'Cuci AC', pk: '1.5', harga: 90000 },
      { nama: 'Cuci AC', pk: '2', harga: 105000 },

      { nama: 'Isi Freon', pk: '0.5', harga: 250000 },
      { nama: 'Isi Freon', pk: '1', harga: 250000 },
      { nama: 'Isi Freon', pk: '1.5', harga: 300000 },
      { nama: 'Isi Freon', pk: '2', harga: 350000 },

      { nama: 'Bongkar AC', harga: 200000 },
      { nama: 'Pasang AC', harga: 200000 },

      { nama: 'Bongkar + Pasang', pk: '0.5', harga: 350000 },
      { nama: 'Bongkar + Pasang', pk: '1', harga: 350000 },
      { nama: 'Bongkar + Pasang', pk: '1.5', harga: 420000 },
      { nama: 'Bongkar + Pasang', pk: '2', harga: 490000 },

      { nama: 'Service/Perbaikan Ringan', pk: '0.5', harga: 150000 },
      { nama: 'Service/Perbaikan Ringan', pk: '1', harga: 150000 },
      { nama: 'Service/Perbaikan Ringan', pk: '1.5', harga: 180000 },
      { nama: 'Service/Perbaikan Ringan', pk: '2', harga: 210000 },
    ],
    skipDuplicates: true,
  })

  const inventorySeedExists = await prisma.stockMovement.findFirst({
    where: { referenceType: 'STOCK_OPNAME', notes: 'Seed awal inventory' },
    select: { id: true },
  })

  if (!inventorySeedExists) {
    await prisma.inventoryItem.createMany({
      data: [
        { sku: 'FREON-R32-1KG', nama: 'Freon R32 (1kg)', uom: 'tabung', harga: 250000, qtyOnHand: 10, minStock: 2 },
        { sku: 'CHEM-CLEANER-1L', nama: 'Chemical Cleaner (1L)', uom: 'botol', harga: 65000, qtyOnHand: 24, minStock: 5 },
        { sku: 'KAPASITOR-35UF', nama: 'Kapasitor 35uF', uom: 'pcs', harga: 45000, qtyOnHand: 20, minStock: 5 },
        { sku: 'PIPA-1/4-M', nama: 'Pipa 1/4 (per meter)', uom: 'meter', harga: 25000, qtyOnHand: 200, minStock: 30 },
        { sku: 'INSULASI-ROLL', nama: 'Insulasi Pipa (roll)', uom: 'pcs', harga: 30000, qtyOnHand: 30, minStock: 5 },
      ],
      skipDuplicates: true,
    })

    const items = await prisma.inventoryItem.findMany({
      where: { sku: { in: ['FREON-R32-1KG', 'CHEM-CLEANER-1L', 'KAPASITOR-35UF', 'PIPA-1/4-M', 'INSULASI-ROLL'] } },
      select: { id: true, qtyOnHand: true },
    })

    await prisma.stockMovement.createMany({
      data: items.map((it) => ({
        itemId: it.id,
        type: 'ADJUSTMENT',
        qty: it.qtyOnHand,
        referenceType: 'STOCK_OPNAME',
        notes: 'Seed awal inventory',
        createdByUserId: admin.uuid,
      })),
    })
  }

  // Services
  // Service 1 - Booking
  await prisma.services.create({
    data: {
      customerId: cust1.uuid,
      jenis_servis: 'AC',
      keluhan: 'AC tidak dingin',
      status: 'Booking',
      status_servis: 'Booking',
      biaya_dasar: 50000,
    },
  })
  console.log('Created service 1 (Booking)')

  // Service 2 - Menunggu Jadwal
  await prisma.services.create({
    data: {
      customerId: cust2.uuid,
      jenis_servis: 'Kulkas',
      keluhan: 'Kulkas mati total',
      status: 'Menunggu Jadwal',
      status_servis: 'Menunggu Jadwal',
      biaya_dasar: 50000,
    },
  })
  console.log('Created service 2 (Menunggu Jadwal)')

  // Service 3 - Teknisi Dikonfirmasi
  await prisma.services.create({
    data: {
      customerId: cust1.uuid,
      jenis_servis: 'Mesin Cuci',
      keluhan: 'Mesin cuci bocor',
      status: 'Teknisi Dikonfirmasi',
      status_servis: 'Teknisi Dikonfirmasi',
      teknisiId: employee.uuid,
      biaya_dasar: 50000,
    },
  })
  console.log('Created service 3 (Teknisi Dikonfirmasi)')

  // Service 4 - Dalam Pengecekan
  await prisma.services.create({
    data: {
      customerId: cust2.uuid,
      jenis_servis: 'AC',
      keluhan: 'Cuci AC',
      status: 'Dalam Pengecekan',
      status_servis: 'Dalam Pengecekan',
      teknisiId: employee.uuid,
      biaya_dasar: 50000,
    },
  })
  console.log('Created service 4 (Dalam Pengecekan)')

  // Service 5 - Menunggu Persetujuan Customer
  await prisma.services.create({
    data: {
      customerId: cust1.uuid,
      jenis_servis: 'Kulkas',
      keluhan: 'Ganti Freon',
      status: 'Menunggu Persetujuan Customer',
      status_servis: 'Menunggu Persetujuan Customer',
      teknisiId: employee.uuid,
      biaya_dasar: 50000,
      estimasi_biaya: 250000,
    },
  })
  console.log('Created service 5 (Menunggu Persetujuan Customer)')

  // Service 6 - Sedang Dikerjakan
  await prisma.services.create({
    data: {
      customerId: cust2.uuid,
      jenis_servis: 'AC',
      keluhan: 'AC Bocor',
      status: 'Sedang Dikerjakan',
      status_servis: 'Sedang Dikerjakan',
      teknisiId: employee.uuid,
      biaya_dasar: 50000,
      estimasi_biaya: 150000,
      biaya_disetujui: true,
    },
  })
  console.log('Created service 6 (Sedang Dikerjakan)')

  // Service 7 - Pekerjaan Selesai
  await prisma.services.create({
    data: {
      customerId: cust1.uuid,
      jenis_servis: 'Mesin Cuci',
      keluhan: 'Ganti Dinamo',
      status: 'Pekerjaan Selesai',
      status_servis: 'Pekerjaan Selesai',
      teknisiId: employee.uuid,
      biaya_dasar: 50000,
      estimasi_biaya: 450000,
      biaya_disetujui: true,
      bukti_foto_before: '/images/placeholder-before.jpg',
      bukti_foto_after: '/images/placeholder-after.jpg',
    },
  })
  console.log('Created service 7 (Pekerjaan Selesai)')

  // Service 8 - Menunggu Pembayaran
  await prisma.services.create({
    data: {
      customerId: cust2.uuid,
      jenis_servis: 'AC',
      keluhan: 'Isi Freon',
      status: 'Menunggu Pembayaran',
      status_servis: 'Menunggu Pembayaran',
      teknisiId: employee.uuid,
      biaya_dasar: 50000,
      estimasi_biaya: 150000,
      biaya: 200000, // Total biaya final
      biaya_disetujui: true,
    },
  })
  console.log('Created service 8 (Menunggu Pembayaran)')

  // Service 9 - Selesai (Garansi Aktif)
  await prisma.services.create({
    data: {
      customerId: cust1.uuid,
      jenis_servis: 'Kulkas',
      keluhan: 'Ganti Karet Pintu',
      status: 'Selesai (Garansi Aktif)',
      status_servis: 'Selesai (Garansi Aktif)',
      teknisiId: employee.uuid,
      biaya_dasar: 50000,
      estimasi_biaya: 100000,
      biaya: 150000,
      biaya_disetujui: true,
      garansi_aktif_sampai: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 hari
    },
  })
  console.log('Created service 9 (Selesai - Garansi Aktif)')

  // Service 10 - Dibatalkan
  await prisma.services.create({
    data: {
      customerId: cust2.uuid,
      jenis_servis: 'AC',
      keluhan: 'AC Mati Total',
      status: 'Dibatalkan',
      status_servis: 'Dibatalkan',
      teknisiId: employee.uuid,
      biaya_dasar: 50000,
      alasan_batal: 'Customer menolak estimasi biaya perbaikan',
    },
  })
  console.log('Created service 10 (Dibatalkan)')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
