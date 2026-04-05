import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type UnitInput = {
  pk: number
  layanan: string[]
}

type ServiceInput = {
  customerId: string
  teknisiId?: string | null
  status_servis: string
  status: string
  keluhan: string
  biaya_dasar: number
  estimasi_biaya?: number | null
  biaya?: number | null
  biaya_disetujui?: boolean
  bukti_foto_before?: string | null
  bukti_foto_after?: string | null
  garansi_aktif_sampai?: Date | null
  alasan_batal?: string | null
  units: UnitInput[]
}

async function main() {
  console.log('Seeding database...')

  await prisma.$transaction([
    prisma.stockMovement.deleteMany(),
    prisma.serviceMaterialUsage.deleteMany(),
    prisma.serviceStatusHistory.deleteMany(),
    prisma.serviceAcUnitLayanan.deleteMany(),
    prisma.serviceAcUnit.deleteMany(),
    prisma.services.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.acServiceCatalog.deleteMany(),
    prisma.customerProfile.deleteMany(),
    prisma.staffProfile.deleteMany(),
    prisma.user.deleteMany(),
  ])

  const admin = await prisma.user.create({
    data: { 
      name: 'Admin TIAMAC', 
      email: 'admin@tiamac.id', 
      password: 'pass1234', 
      status: 'ACTIVE' 
    },
  })
  
  await prisma.staffProfile.create({ 
    data: { userId: admin.id, role: 'admin' } 
  })

  const staffUsers = await Promise.all(
    ['adi', 'bima', 'citra'].map((name, idx) =>
      prisma.user.create({
        data: {
          name: `Teknisi ${name.toUpperCase()}`,
          email: `teknisi${idx + 1}@tiamac.id`,
          password: 'pass1234',
          status: 'ACTIVE',
        },
      })
    )
  )

  await prisma.staffProfile.createMany({
    data: staffUsers.map((u) => ({ userId: u.id, role: 'karyawan' })),
  })

  const customerUsers = await Promise.all(
    [
      { name: 'Dina Pratiwi', email: 'dina@customer.id', telp: '081234000001', alamat: 'Jl. Meruya Utara No. 10' },
      { name: 'Rama Hidayat', email: 'rama@customer.id', telp: '081234000002', alamat: 'Jl. Puri Indah Blok A3' },
      { name: 'Sari Wulandari', email: 'sari@customer.id', telp: '081234000003', alamat: 'Jl. Kedoya Raya No. 7' },
    ].map((c) =>
      prisma.user.create({
        data: { name: c.name, email: c.email, password: 'pass1234', status: 'ACTIVE' },
      })
    )
  )

  await prisma.customerProfile.createMany({
    data: [
      { userId: customerUsers[0].id, no_telp: '081234000001', provinsi: 'DKI Jakarta', alamat: 'Jl. Meruya Utara No. 10' },
      { userId: customerUsers[1].id, no_telp: '081234000002', provinsi: 'DKI Jakarta', alamat: 'Jl. Puri Indah Blok A3' },
      { userId: customerUsers[2].id, no_telp: '081234000003', provinsi: 'DKI Jakarta', alamat: 'Jl. Kedoya Raya No. 7' },
    ],
  })

  await prisma.acServiceCatalog.createMany({
    data: [
      { nama: 'Cuci AC', pk: '0.5', harga: 75000 },
      { nama: 'Cuci AC', pk: '1', harga: 80000 },
      { nama: 'Cuci AC', pk: '1.5', harga: 90000 },
      { nama: 'Cuci AC', pk: '2', harga: 105000 },
      { nama: 'Isi Freon', pk: '0.5', harga: 250000 },
      { nama: 'Isi Freon', pk: '1', harga: 260000 },
      { nama: 'Isi Freon', pk: '1.5', harga: 300000 },
      { nama: 'Isi Freon', pk: '2', harga: 350000 },
      { nama: 'Bongkar + Pasang', pk: '0.5', harga: 350000 },
      { nama: 'Bongkar + Pasang', pk: '1', harga: 380000 },
      { nama: 'Bongkar + Pasang', pk: '1.5', harga: 420000 },
      { nama: 'Bongkar + Pasang', pk: '2', harga: 490000 },
      { nama: 'Service/Perbaikan Ringan', pk: '0.5', harga: 150000 },
      { nama: 'Service/Perbaikan Ringan', pk: '1', harga: 170000 },
      { nama: 'Service/Perbaikan Ringan', pk: '1.5', harga: 190000 },
      { nama: 'Service/Perbaikan Ringan', pk: '2', harga: 210000 },
    ],
  })

  await prisma.inventoryItem.createMany({
    data: [
      { sku: 'FREON-R32-1KG', nama: 'Freon R32 (1kg)', uom: 'tabung', harga: 250000, qtyOnHand: 12, minStock: 2 },
      { sku: 'CHEM-CLEANER-1L', nama: 'Chemical Cleaner (1L)', uom: 'botol', harga: 65000, qtyOnHand: 18, minStock: 5 },
      { sku: 'KAPASITOR-35UF', nama: 'Kapasitor 35uF', uom: 'pcs', harga: 45000, qtyOnHand: 20, minStock: 5 },
      { sku: 'PIPA-1/4-M', nama: 'Pipa 1/4 (per meter)', uom: 'meter', harga: 25000, qtyOnHand: 200, minStock: 30 },
      { sku: 'INSULASI-ROLL', nama: 'Insulasi Pipa (roll)', uom: 'pcs', harga: 30000, qtyOnHand: 30, minStock: 5 },
    ],
  })

  const inventoryItems = await prisma.inventoryItem.findMany({ select: { id: true, qtyOnHand: true } })
  await prisma.stockMovement.createMany({
    data: inventoryItems.map((it) => ({
      itemId: it.id,
      type: 'ADJUSTMENT',
      qty: it.qtyOnHand,
      referenceType: 'STOCK_OPNAME',
      notes: 'Seed awal inventory',
      createdByUserId: admin.id,
    })),
  })

  const catalog = await prisma.acServiceCatalog.findMany({ select: { uuid: true, nama: true, pk: true, harga: true } })

  const getCatalog = (nama: string, pk: number) => {
    const pkText = String(pk)
    return catalog.find((c) => c.nama === nama && (c.pk === pkText || c.pk === null))
  }

  const buildKeluhan = (text: string, alamat: string, jadwal: string) =>
    [`Keluhan: ${text}`, `Alamat: ${alamat}`, `Jadwal: ${jadwal}`].join('\n')

  const ALUR_SERVIS = [
    { id: 1, value: 'Booking', label: 'Booking', role: 'customer' },
    { id: 2, value: 'Menunggu Jadwal', label: 'Menunggu Jadwal', role: 'admin' },
    { id: 3, value: 'Konfirmasi Teknisi', label: 'Konfirmasi Teknisi', role: 'teknisi' },
    { id: 4, value: 'Pengecekan Unit', label: 'Pengecekan Unit', role: 'teknisi' },
    { id: 5, value: 'Menunggu Persetujuan Customer', label: 'Menunggu Persetujuan Customer', role: 'teknisi' },
    { id: 6, value: 'Perbaikan Unit', label: 'Perbaikan Unit', role: 'teknisi' },
    { id: 7, value: 'Menunggu Pembayaran', label: 'Menunggu Pembayaran', role: 'teknisi' },
    { id: 8, value: 'Selesai (Garansi Aktif)', label: 'Selesai (Garansi Aktif)', role: 'admin' },
    { id: 9, value: 'Dibatalkan', label: 'Dibatalkan', role: 'customer' },
  ];

  const getAlurNotes = (status: string) => {
    const notes: Record<string, string> = {
      'Booking': 'Pesanan baru dibuat dengan biaya kunjungan disetujui.',
      'Menunggu Jadwal': 'Admin telah mengonfirmasi booking and sedang mengatur jadwal.',
      'Konfirmasi Teknisi': 'Teknisi telah dikonfirmasi untuk pesanan ini.',
      'Pengecekan Unit': 'Teknisi sedang melakukan pengecekan unit di lokasi.',
      'Menunggu Persetujuan Customer': 'Teknisi telah mengajukan detail rincian biaya servis. Menunggu persetujuan customer.',
      'Perbaikan Unit': 'Customer menyetujui biaya. Teknisi mulai melakukan pengerjaan.',
      'Menunggu Pembayaran': 'Pekerjaan selesai. Menunggu customer melakukan pembayaran.',
      'Selesai (Garansi Aktif)': 'Pembayaran telah dikonfirmasi. Layanan selesai dan garansi diaktifkan.',
      'Dibatalkan': 'Pesanan telah dibatalkan.'
    };
    return notes[status] || 'Pencatatan status otomatis.';
  };

  const seedStatusHistoryForService = async (serviceId: string, currentStatus: string, customerId: string, teknisiId: string | null, adminId: string) => {
    const currentIndex = ALUR_SERVIS.findIndex(step => step.value === currentStatus);
    let stepsToSeed = [];
    
    if (currentStatus === 'Dibatalkan') {
      stepsToSeed = ALUR_SERVIS.slice(0, 1);
      stepsToSeed.push(ALUR_SERVIS[ALUR_SERVIS.length - 1]);
    } else if (currentIndex !== -1) {
      stepsToSeed = ALUR_SERVIS.slice(0, currentIndex + 1);
    }

    for (const [idx, step] of stepsToSeed.entries()) {
      const actorId = step.role === 'customer' ? customerId : step.role === 'teknisi' ? (teknisiId || adminId) : adminId;

      await prisma.serviceStatusHistory.create({
        data: {
          serviceId,
          status: step.value,
          status_servis: step.value,
          notes: getAlurNotes(step.value),
          changedByUserId: actorId,
          createdAt: new Date(Date.now() - ((stepsToSeed.length - idx) * 3600000))
        }
      });
    }
  };

  const createService = async (input: ServiceInput) => {
    const service = await prisma.services.create({
      data: {
        customerId: input.customerId,
        teknisiId: input.teknisiId ?? null,
        jenis_servis: 'AC',
        keluhan: input.keluhan,
        status: input.status,
        status_servis: input.status_servis,
        biaya_dasar: input.biaya_dasar,
        estimasi_biaya: input.estimasi_biaya ?? null,
        biaya: input.biaya ?? null,
        biaya_disetujui: input.biaya_disetujui ?? false,
        bukti_foto_before: input.bukti_foto_before ?? null,
        bukti_foto_after: input.bukti_foto_after ?? null,
        garansi_aktif_sampai: input.garansi_aktif_sampai ?? null,
        alasan_batal: input.alasan_batal ?? null,
      },
    })

    await seedStatusHistoryForService(
      service.id,
      input.status_servis,
      input.customerId,
      input.teknisiId ?? null,
      admin.id
    );

    for (const unit of input.units) {
      const createdUnit = await prisma.serviceAcUnit.create({
        data: { serviceId: service.id, pk: unit.pk },
      })
      for (const layananName of unit.layanan) {
        const catalogRow = getCatalog(layananName, unit.pk)
        if (!catalogRow) throw new Error(`Catalog tidak ditemukan: ${layananName} PK ${unit.pk}`)
        await prisma.serviceAcUnitLayanan.create({
          data: {
            unitId: createdUnit.id,
            catalogId: catalogRow.uuid,
            nama: catalogRow.nama,
            harga: catalogRow.harga,
          },
        })
      }
    }

    return service
  }

  const addMaterialUsage = async (serviceId: string, itemSku: string, qty: number, createdBy: string) => {
    const item = await prisma.inventoryItem.findUnique({ where: { sku: itemSku }, select: { id: true, harga: true } })
    if (!item) throw new Error(`Item tidak ditemukan: ${itemSku}`)

    await prisma.$transaction(async (tx) => {
      await tx.serviceMaterialUsage.create({
        data: {
          serviceId,
          itemId: item.id,
          qty,
          harga_satuan: item.harga,
          createdByUserId: createdBy,
        },
      })

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { qtyOnHand: { decrement: qty } },
      })

      await tx.stockMovement.create({
        data: {
          itemId: item.id,
          type: 'OUT',
          qty,
          referenceType: 'SERVICE_USAGE',
          referenceId: serviceId,
          notes: 'Seed pemakaian barang',
          createdByUserId: createdBy,
        },
      })
    })
  }

  // Sample Data
  const serviceBooking = await createService({
    customerId: customerUsers[0].id,
    status_servis: 'Booking',
    status: 'Booking',
    biaya_dasar: 50000,
    keluhan: buildKeluhan('AC kurang dingin di ruang tamu', 'Jl. Meruya Utara No. 10', '2026-03-20 09:00'),
    units: [{ pk: 1, layanan: ['Cuci AC'] }],
  })

  const serviceMenungguJadwal = await createService({
    customerId: customerUsers[1].id,
    status_servis: 'Menunggu Jadwal',
    status: 'Menunggu Jadwal',
    biaya_dasar: 50000,
    keluhan: buildKeluhan('AC bocor air, perlu pengecekan', 'Jl. Puri Indah Blok A3', '2026-03-21 10:00'),
    units: [{ pk: 1.5, layanan: ['Service/Perbaikan Ringan'] }],
  })

  const serviceTeknisi = await createService({
    customerId: customerUsers[2].id,
    teknisiId: staffUsers[0].id,
    status_servis: 'Konfirmasi Teknisi',
    status: 'Konfirmasi Teknisi',
    biaya_dasar: 50000,
    keluhan: buildKeluhan('AC tidak dingin sama sekali', 'Jl. Kedoya Raya No. 7', '2026-03-22 13:00'),
    units: [
      { pk: 1, layanan: ['Isi Freon'] },
      { pk: 0.5, layanan: ['Cuci AC'] },
    ],
  })

  const serviceMenungguPersetujuan = await createService({
    customerId: customerUsers[0].id,
    teknisiId: staffUsers[1].id,
    status_servis: 'Menunggu Persetujuan Customer',
    status: 'Menunggu Persetujuan Customer',
    biaya_dasar: 50000,
    estimasi_biaya: 620000,
    keluhan: buildKeluhan('AC bau dan kurang dingin', 'Jl. Meruya Utara No. 10', '2026-03-23 11:00'),
    units: [
      { pk: 1.5, layanan: ['Cuci AC', 'Isi Freon'] },
      { pk: 1, layanan: ['Service/Perbaikan Ringan'] },
    ],
  })

  const serviceSedangDikerjakan = await createService({
    customerId: customerUsers[1].id,
    teknisiId: staffUsers[1].id,
    status_servis: 'Perbaikan Unit',
    status: 'Perbaikan Unit',
    biaya_dasar: 50000,
    estimasi_biaya: 480000,
    biaya_disetujui: true,
    keluhan: buildKeluhan('AC bocor setelah cuci', 'Jl. Puri Indah Blok A3', '2026-03-24 14:00'),
    units: [
      { pk: 1, layanan: ['Service/Perbaikan Ringan'] },
      { pk: 1, layanan: ['Cuci AC'] },
    ],
  })

  const serviceMenungguPembayaran = await createService({
    customerId: customerUsers[2].id,
    teknisiId: staffUsers[2].id,
    status_servis: 'Menunggu Pembayaran',
    status: 'Menunggu Pembayaran',
    biaya_dasar: 50000,
    estimasi_biaya: 430000,
    biaya: 450000,
    biaya_disetujui: true,
    bukti_foto_before: '/images/placeholder-before.jpg',
    bukti_foto_after: '/images/placeholder-after.jpg',
    keluhan: buildKeluhan('AC tidak nyala setelah mati lampu', 'Jl. Kedoya Raya No. 7', '2026-03-25 16:00'),
    units: [{ pk: 1.5, layanan: ['Service/Perbaikan Ringan'] }],
  })

  const serviceSelesai = await createService({
    customerId: customerUsers[0].id,
    teknisiId: staffUsers[0].id,
    status_servis: 'Selesai (Garansi Aktif)',
    status: 'Selesai (Garansi Aktif)',
    biaya_dasar: 50000,
    estimasi_biaya: 380000,
    biaya: 400000,
    biaya_disetujui: true,
    garansi_aktif_sampai: new Date(new Date().setDate(new Date().getDate() + 30)),
    bukti_foto_before: '/images/placeholder-before.jpg',
    bukti_foto_after: '/images/placeholder-after.jpg',
    keluhan: buildKeluhan('AC butuh bongkar pasang', 'Jl. Meruya Utara No. 10', '2026-03-18 08:30'),
    units: [{ pk: 1, layanan: ['Bongkar + Pasang'] }],
  })

  await createService({
    customerId: customerUsers[1].id,
    teknisiId: staffUsers[2].id,
    status_servis: 'Dibatalkan',
    status: 'Dibatalkan',
    biaya_dasar: 50000,
    alasan_batal: 'Customer menolak estimasi biaya perbaikan',
    keluhan: buildKeluhan('AC mati total', 'Jl. Puri Indah Blok A3', '2026-03-26 09:30'),
    units: [{ pk: 1, layanan: ['Isi Freon'] }],
  })

  await addMaterialUsage(serviceMenungguPersetujuan.id, 'CHEM-CLEANER-1L', 2, staffUsers[1].id)
  await addMaterialUsage(serviceMenungguPersetujuan.id, 'PIPA-1/4-M', 3, staffUsers[1].id)
  await addMaterialUsage(serviceSedangDikerjakan.id, 'KAPASITOR-35UF', 1, staffUsers[1].id)
  await addMaterialUsage(serviceMenungguPembayaran.id, 'INSULASI-ROLL', 1, staffUsers[2].id)

  console.log('Seed selesai:', {
    booking: serviceBooking.id,
    menungguJadwal: serviceMenungguJadwal.id,
    teknisi: serviceTeknisi.id,
    menungguPersetujuan: serviceMenungguPersetujuan.id,
    sedangDikerjakan: serviceSedangDikerjakan.id,
    menungguPembayaran: serviceMenungguPembayaran.id,
    selesai: serviceSelesai.id,
  })
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
