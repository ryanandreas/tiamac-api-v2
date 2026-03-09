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
