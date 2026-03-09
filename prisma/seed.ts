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

  // Services
  // Service 1
  const service1 = await prisma.services.create({
    data: {
      customerId: cust1.uuid,
      jenis_servis: 'AC',
      keluhan: 'AC tidak dingin',
      status: 'Proses Servis',
      status_servis: 'Sedang Berjalan',
      biaya: 150000,
      teknisiId: employee.uuid,
    },
  })
  console.log('Created service 1')

  // Service 2
  const service2 = await prisma.services.create({
    data: {
      customerId: cust2.uuid,
      jenis_servis: 'Kulkas',
      keluhan: 'Kulkas mati total',
      status: 'Menunggu Jadwal',
      status_servis: 'Menunggu Jadwal',
      biaya: 0,
    },
  })
  console.log('Created service 2')

  // Service 3
  const service3 = await prisma.services.create({
    data: {
      customerId: cust1.uuid,
      jenis_servis: 'Mesin Cuci',
      keluhan: 'Mesin cuci bocor',
      status: 'Konfirmasi Teknisi',
      status_servis: 'Konfirmasi Teknisi',
      biaya: 0,
      teknisiId: employee.uuid,
    },
  })
  console.log('Created service 3')

  // Service 4
  const service4 = await prisma.services.create({
    data: {
      customerId: cust2.uuid,
      jenis_servis: 'AC',
      keluhan: 'Cuci AC',
      status: 'Menunggu Pembayaran',
      status_servis: 'Menunggu Pembayaran',
      biaya: 75000,
      teknisiId: employee.uuid,
    },
  })
  console.log('Created service 4')

  // Service 5
  const service5 = await prisma.services.create({
    data: {
      customerId: cust1.uuid,
      jenis_servis: 'Kulkas',
      keluhan: 'Ganti Freon',
      status: 'Selesai',
      status_servis: 'Selesai',
      biaya: 250000,
      teknisiId: employee.uuid,
    },
  })
  console.log('Created service 5')
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
