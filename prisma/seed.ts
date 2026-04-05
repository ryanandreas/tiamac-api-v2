import { PrismaClient, InventoryUom, PaymentType, StockMovementType, StockReferenceType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with populated technicians and customers...')

  await prisma.$transaction([
    prisma.stockMovement.deleteMany(),
    prisma.serviceMaterialUsage.deleteMany(),
    prisma.serviceStatusHistory.deleteMany(),
    prisma.serviceAcUnitLayanan.deleteMany(),
    prisma.serviceAcUnit.deleteMany(),
    prisma.servicePayment.deleteMany(),
    prisma.services.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.acServiceCatalog.deleteMany(),
    prisma.customerProfile.deleteMany(),
    prisma.staffProfile.deleteMany(),
    prisma.user.deleteMany(),
  ])

  // 1. ADMINS
  const admin = await prisma.user.create({
    data: { name: 'Admin TIAMAC', email: 'admin@tiamac.id', password: 'pass1234', status: 'ACTIVE' },
  })
  await prisma.staffProfile.create({ data: { userId: admin.id, role: 'admin' } })

  // 2. TECHNICIANS (Some more)
  const teknisiList = [
    { name: 'Teknisi UTAMA', email: 'teknisi1@tiamac.id', wilayah: 'Jakarta Barat' },
    { name: 'Adi Saputra', email: 'adi@teknisi.id', wilayah: 'Jakarta Selatan' },
    { name: 'Budi Raharjo', email: 'budi@teknisi.id', wilayah: 'Jakarta Timur' },
    { name: 'Cahyo Utomo', email: 'cahyo@teknisi.id', wilayah: 'Jakarta Utara' },
    { name: 'Dedi Kurniawan', email: 'dedi@teknisi.id', wilayah: 'Tangerang' },
  ];

  const createdTeknisi = [];
  for (const t of teknisiList) {
    const user = await prisma.user.create({
      data: { name: t.name, email: t.email, password: 'pass1234', status: 'ACTIVE' }
    });
    await prisma.staffProfile.create({
      data: { userId: user.id, role: 'teknisi', no_telp: '0812' + Math.floor(Math.random()*100000000), wilayah: t.wilayah }
    });
    createdTeknisi.push(user);
  }
  const masterTeknisi = createdTeknisi[0];

  // 3. CUSTOMERS (A lot more)
  const customerList = [
    { name: 'Dina Pratiwi (Master)', email: 'dina@customer.id', alamat: 'Jl. Meruya Utara No. 10' },
    { name: 'Sari Wijaya', email: 'sari@customer.id', alamat: 'Apartemen Green Park L-12' },
    { name: 'Rama Pratama', email: 'rama@customer.id', alamat: 'Kavling DKI Blok C-9' },
    { name: 'Eka Santoso', email: 'eka@customer.id', alamat: 'Jl. Kebon Jeruk No. 45' },
    { name: 'Fani Lestari', email: 'fani@customer.id', alamat: 'Perum Puri Beta 2' },
    { name: 'Gani Hermawan', email: 'gani@customer.id', alamat: 'Jl. Joglo Raya No. 88' },
    { name: 'Hani Susanti', email: 'hani@customer.id', alamat: 'Ciledug Indah 1' },
    { name: 'Indra Jaya', email: 'indra@customer.id', alamat: 'Villa Meruya Blok F-1' },
    { name: 'Junaidi', email: 'juna@customer.id', alamat: 'Palmerah Barat No. 2' },
    { name: 'Kania Putri', email: 'kania@customer.id', alamat: 'Grogol Indah No. 14' },
  ];

  const createdCustomers = [];
  for (const c of customerList) {
    const user = await prisma.user.create({
      data: { name: c.name, email: c.email, password: 'pass1234', status: 'ACTIVE' }
    });
    await prisma.customerProfile.create({
      data: { userId: user.id, no_telp: '0855' + Math.floor(Math.random()*100000000), alamat: c.alamat, provinsi: 'DKI Jakarta' }
    });
    createdCustomers.push(user);
  }
  const masterCustomer = createdCustomers[0];

  // 4. SERVICE CATALOG & INVENTORY (Same as before)
  await prisma.acServiceCatalog.createMany({
    data: [
      { nama: 'Bongkar', pk: '-', harga: 150000 },
      { nama: 'Pasang', pk: '-', harga: 250000 },
      { nama: 'Cuci AC', pk: '1', harga: 85000 },
      { nama: 'Isi Freon', pk: '1', harga: 275000 },
      { nama: 'Service/Perbaikan Ringan', pk: '1', harga: 180000 },
    ],
  });
  const catalog = await prisma.acServiceCatalog.findMany();
  const getCatalog = (nama: string) => catalog.find(c => c.nama === nama);

  const freon = await prisma.inventoryItem.create({ data: { sku: 'FREON-R32-1KG', nama: 'Freon R32 (1kg)', uom: 'tabung', harga: 250000, qtyOnHand: 50, minStock: 2 } });
  const kapasitor = await prisma.inventoryItem.create({ data: { sku: 'KAPASITOR-35UF', nama: 'Kapasitor 35uF', uom: 'pcs', harga: 45000, qtyOnHand: 100, minStock: 5 } });

  // 5. ALUR STATUS & HISTORY LOGIC (Same as before)
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
  ];

  const getAlurNotes = (status: string) => {
    const notes: Record<string, string> = {
      'Booking': 'Pesanan baru dibuat dengan biaya kunjungan disetujui.',
      'Menunggu Jadwal': 'Pembayaran DP lunas. Admin sedang mengatur jadwal.',
      'Konfirmasi Teknisi': 'Teknisi telah ditugaskan.',
      'Pengecekan Unit': 'Teknisi sedang melakukan diagnosa di lokasi.',
      'Menunggu Persetujuan Customer': 'Biaya perbaikan telah diinput. Menunggu persetujuan Anda.',
      'Perbaikan Unit': 'Biaya disetujui. Teknisi sedang bekerja.',
      'Menunggu Pembayaran': 'Pekerjaan selesai. Mohon lakukan pelunasan.',
      'Selesai (Garansi Aktif)': 'Pembayaran dikonfirmasi. Garansi 30 hari aktif.',
      'Dibatalkan': 'Pesanan dibatalkan.'
    };
    return notes[status] || 'Status updated.';
  };

  const seedStatusHistory = async (serviceId: string, currentStatus: string) => {
    const currentIndex = ALUR_SERVIS.findIndex(s => s.value === currentStatus);
    const steps = currentStatus === 'Dibatalkan' ? [ALUR_SERVIS[0], ALUR_SERVIS[ALUR_SERVIS.length - 1]] : ALUR_SERVIS.slice(0, currentIndex + 1);
    for (const [idx, step] of steps.entries()) {
      const actorId = step.role === 'customer' ? masterCustomer.id : step.role === 'teknisi' ? masterTeknisi.id : admin.id;
      await prisma.serviceStatusHistory.create({
        data: {
          serviceId, status: step.value, status_servis: step.value, notes: getAlurNotes(step.value),
          changedByUserId: actorId, createdAt: new Date(Date.now() - ((steps.length - idx) * 3600000))
        }
      });
    }
  };

  const createServiceWithStatus = async (status: string, index: number) => {
    const statusIndex = ALUR_SERVIS.findIndex(s => s.value === status);
    const isPastCheck = statusIndex >= 2; 
    const isCompleted = status === 'Selesai (Garansi Aktif)';
    const isWorking = statusIndex >= 5 && status !== 'Dibatalkan';
    const BIAYA_DASAR = 50000;
    
    const unitCount = (index % 2 === 0) ? 2 : 3;
    const unitSpecs = [];
    let totalLayanan = 0;
    for (let u = 0; u < unitCount; u++) {
      const services = u === 0 ? ['Cuci AC'] : (u === 1 ? ['Cuci AC', 'Isi Freon'] : ['Service/Perbaikan Ringan']);
      const unitTotal = services.reduce((acc, s) => acc + (getCatalog(s)?.harga || 0), 0);
      unitSpecs.push({ pk: 1, layanan: services, total: unitTotal });
      totalLayanan += unitTotal;
    }
    const materialPrice = (statusIndex >= 4 && status !== 'Dibatalkan') ? (freon.harga + kapasitor.harga) : 0;
    const calculatedTotal = BIAYA_DASAR + totalLayanan + materialPrice;

    const service = await prisma.services.create({
      data: {
        customerId: masterCustomer.id, teknisiId: isPastCheck ? masterTeknisi.id : null, jenis_servis: 'AC',
        keluhan: `Perbaikan ${unitCount} Unit AC #${index + 1}\nLokasi: Lantai ${index + 1}\nGejala: Tidak Dingin`,
        status, status_servis: status, biaya_dasar: BIAYA_DASAR,
        estimasi_biaya: (statusIndex >= 4 && status !== 'Dibatalkan') ? calculatedTotal : null,
        biaya: isWorking ? calculatedTotal : null, biaya_disetujui: isWorking,
        bukti_foto_before: isWorking ? '/images/placeholder-before.jpg' : null,
        bukti_foto_after: (statusIndex >= 6 && status !== 'Dibatalkan') ? '/images/placeholder-after.jpg' : null,
        garansi_aktif_sampai: isCompleted ? new Date(Date.now() + 30 * 24 * 3600000) : null,
        alasan_batal: status === 'Dibatalkan' ? 'Maaf, salah pilih jadwal' : null,
      }
    });

    await seedStatusHistory(service.id, status);
    for (const spec of unitSpecs) {
      const unit = await prisma.serviceAcUnit.create({ data: { serviceId: service.id, pk: spec.pk } });
      for (const sName of spec.layanan) {
        const cat = getCatalog(sName);
        if (cat) await prisma.serviceAcUnitLayanan.create({ data: { unitId: unit.id, catalogId: cat.uuid, nama: cat.nama, harga: cat.harga } });
      }
    }
    // Payments
    const dpStatus = (statusIndex >= 1 && status !== 'Dibatalkan') ? 'PAID' : 'PENDING';
    await prisma.servicePayment.create({ data: { serviceId: service.id, type: PaymentType.DOWN_PAYMENT, amount: BIAYA_DASAR, status: dpStatus, metodePembayaran: dpStatus === 'PAID' ? 'qris' : null } });
    if (statusIndex >= 6 && status !== 'Dibatalkan') {
      const fullStatus = isCompleted ? 'PAID' : 'PENDING';
      await prisma.servicePayment.create({ data: { serviceId: service.id, type: PaymentType.FULL_PAYMENT, amount: calculatedTotal - BIAYA_DASAR, status: fullStatus, metodePembayaran: fullStatus === 'PAID' ? 'bank_transfer' : null, bank: fullStatus === 'PAID' ? 'bca' : null } });
    }
    // Materials
    if (statusIndex >= 4 && status !== 'Dibatalkan') {
      await prisma.serviceMaterialUsage.createMany({ data: [ { serviceId: service.id, itemId: freon.id, qty: 1, harga_satuan: freon.harga, notes: 'Isi Freon', createdByUserId: masterTeknisi.id }, { serviceId: service.id, itemId: kapasitor.id, qty: 1, harga_satuan: kapasitor.harga, notes: 'Ganti Kapasitor', createdByUserId: masterTeknisi.id } ] });
      await prisma.stockMovement.createMany({ data: [ { itemId: freon.id, type: StockMovementType.OUT, qty: 1, referenceType: StockReferenceType.SERVICE_USAGE, referenceId: service.id, createdByUserId: masterTeknisi.id }, { itemId: kapasitor.id, type: StockMovementType.OUT, qty: 1, referenceType: StockReferenceType.SERVICE_USAGE, referenceId: service.id, createdByUserId: masterTeknisi.id } ] });
    }
    return service;
  };

  // 6. GENERATE DATA
  for (const step of ALUR_SERVIS) {
    console.log(`Generating 3 samples for: ${step.value}...`);
    for (let i = 0; i < 3; i++) { await createServiceWithStatus(step.value, i); }
  }

  console.log('Seeding completed with 5 Technicians and 10 Customers!');
}

main().then(async () => { await prisma.$disconnect() }).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) });
