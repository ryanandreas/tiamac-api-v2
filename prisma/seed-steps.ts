import { PrismaClient } from '@prisma/client'
import { generateOrderId } from '../lib/utils/id-utils'

const prisma = new PrismaClient()

async function main() {
  console.log('--- START SPECIAL WORKFLOW SEED ---')

  // 0. Clean up previous special seed services
  await prisma.serviceStatusHistory.deleteMany({})
  await prisma.serviceMaterialUsage.deleteMany({})
  await prisma.serviceAcUnitLayanan.deleteMany({})
  await prisma.serviceAcUnit.deleteMany({})
  await prisma.services.deleteMany({})

  // 1. Identify or Create the Target Technician
  const techEmail = 'teknisi1@tiamac.id'
  let technician = await prisma.user.findUnique({ where: { email: techEmail } })

  if (!technician) {
    technician = await prisma.user.create({
      data: {
        name: 'Teknisi Satu',
        email: techEmail,
        password: 'pass1234',
        status: 'ACTIVE',
        staffProfile: {
          create: { role: 'teknisi' }
        }
      }
    })
  }

  const admin = await prisma.user.findFirst({ where: { email: 'admin@tiamac.id' } })
  const adminId = admin?.id || technician.id // Fallback

  const customers = await prisma.user.findMany({
    where: { 
      customerProfile: {
        isNot: null
      }
    },
    take: 10
  })
  if (customers.length < 1) throw new Error('Seeding aborted: No genuine customers found')

  const catalog = await prisma.acServiceCatalog.findMany()
  const inventory = await prisma.inventoryItem.findMany()

  const ALUR_SERVIS = [
    { value: 'Booking', role: 'customer' },
    { value: 'Menunggu Jadwal', role: 'admin' },
    { value: 'Konfirmasi Teknisi', role: 'teknisi' },
    { value: 'Pengecekan Unit', role: 'teknisi' },
    { value: 'Menunggu Persetujuan Customer', role: 'teknisi' },
    { value: 'Perbaikan Unit', role: 'teknisi' },
    { value: 'Menunggu Pembayaran', role: 'teknisi' },
    { value: 'Selesai (Garansi Aktif)', role: 'admin' },
    { value: 'Dibatalkan', role: 'customer' },
  ]

  const getAlurNotes = (status: string) => {
    const notes: Record<string, string> = {
      'Booking': 'Pesanan baru dibuat oleh customer.',
      'Menunggu Jadwal': 'Admin mengatur jadwal pengerjaan.',
      'Konfirmasi Teknisi': 'Teknisi mengonfirmasi kehadiran.',
      'Pengecekan Unit': 'Pengecekan fisik unit di lokasi.',
      'Menunggu Persetujuan Customer': 'Estimasi biaya diajukan ke customer.',
      'Perbaikan Unit': 'Persetujuan didapat, perbaikan dimulai.',
      'Menunggu Pembayaran': 'Perbaikan selesai, invoice terbit.',
      'Selesai (Garansi Aktif)': 'Pembayaran diterima, garansi berjalan.',
      'Dibatalkan': 'Servis dibatalkan.'
    }
    return notes[status] || 'Update status.'
  }

  // Seeding Loop: 2 services per step
  for (const step of ALUR_SERVIS) {
    console.log(`Generating 2 services for status: ${step.value}...`)

    for (let i = 1; i <= 2; i++) {
       const customer = customers[i % customers.length]
       const techId = ['Booking', 'Menunggu Jadwal'].includes(step.value) ? null : technician.id
        const serviceId = generateOrderId()
        const service = await prisma.services.create({
          data: {
            id: serviceId,
            customerId: customer.id,
            teknisiId: techId,
            jenis_servis: 'AC',
            keluhan: `Keluhan Servis ${step.value} - Unit ${i}\nJadwal: 2026-04-02 0${i}:00`,
            status: step.value,
            status_servis: step.value,
            biaya_dasar: 50000,
            estimasi_biaya: ['Menunggu Persetujuan Customer', 'Perbaikan Unit', 'Menunggu Pembayaran', 'Selesai (Garansi Aktif)'].includes(step.value) ? 450000 : null,
            biaya: ['Menunggu Pembayaran', 'Selesai (Garansi Aktif)'].includes(step.value) ? 450000 : null,
            biaya_disetujui: ['Perbaikan Unit', 'Menunggu Pembayaran', 'Selesai (Garansi Aktif)'].includes(step.value),
            alasan_batal: step.value === 'Dibatalkan' ? 'Permintaan Customer' : null
          }
        })

       // Create Units
       await prisma.serviceAcUnit.create({
         data: {
           serviceId: service.id,
           pk: "1.0",
           layanan: {
             create: {
               nama: 'Cuci AC',
               harga: 80000,
             }
           }
         }
       })

       // Seed History Trace
       const currentIndex = ALUR_SERVIS.findIndex(s => s.value === step.value)
       let historySteps = []
       if (step.value === 'Dibatalkan') {
          historySteps = [ALUR_SERVIS[0], ALUR_SERVIS[8]]
       } else {
          historySteps = ALUR_SERVIS.slice(0, currentIndex + 1)
       }

       for (const [idx, hStep] of historySteps.entries()) {
          const changedBy = hStep.role === 'customer' ? customer.id : hStep.role === 'teknisi' ? technician.id : adminId
          await prisma.serviceStatusHistory.create({
            data: {
              serviceId: service.id,
              status: hStep.value,
              status_servis: hStep.value,
              notes: getAlurNotes(hStep.value),
              changedByUserId: changedBy,
              createdAt: new Date(Date.now() - (historySteps.length - idx) * 3600000)
            }
          })
       }

       // Add material usage for later steps
       if (['Menunggu Persetujuan Customer', 'Perbaikan Unit'].includes(step.value) && inventory.length > 0) {
          await prisma.serviceMaterialUsage.create({
            data: {
              serviceId: service.id,
              itemId: inventory[0].id,
              qty: 1,
              harga_satuan: inventory[0].harga,
              createdByUserId: technician.id
            }
          })
       }
    }
  }

  console.log('--- ALL STEPS SEEDED SUCCESSFULLY ---')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
