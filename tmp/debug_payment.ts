
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const serviceId = 'e87b171a-ad6c-4fc2-8f99-63cb8794a8e5'
  const service = await prisma.services.findUnique({
    where: { id: serviceId },
    include: {
      acUnits: {
        include: {
          layanan: true,
        },
      },
    },
  })

  if (!service) {
    console.log('Service not found')
    return
  }

  console.log('--- Service Data ---')
  console.log('ID:', service.id)
  console.log('Status Servis:', service.status_servis)
  console.log('Biaya (Full):', service.biaya)
  console.log('Biaya Dasar (DP):', service.biaya_dasar)
  console.log('Estimasi Biaya:', service.estimasi_biaya)
  
  const biayaKunjungan = service.biaya_dasar ?? 50000
  const layananTotal = service.acUnits.reduce(
    (sum, unit) => sum + unit.layanan.reduce((inner, layanan) => inner + layanan.harga, 0),
    0
  )
  const totalEstimasi = biayaKunjungan + layananTotal
  const totalFinal = service.biaya ?? service.estimasi_biaya ?? totalEstimasi

  const isPendingInitial = service.status_servis === "Booking"
  const dpAmount = biayaKunjungan
  const pelunasanAmount = Math.max(0, totalFinal - biayaKunjungan)
  const amountToPay = isPendingInitial ? dpAmount : pelunasanAmount

  console.log('--- Calculation Results ---')
  console.log('Layanan Total:', layananTotal)
  console.log('Total Estimasi:', totalEstimasi)
  console.log('Total Final:', totalFinal)
  console.log('Is Pending Initial:', isPendingInitial)
  console.log('DP Amount:', dpAmount)
  console.log('Pelunasan Amount:', pelunasanAmount)
  console.log('Amount to Pay:', amountToPay)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
