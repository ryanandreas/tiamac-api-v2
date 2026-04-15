import { PrismaClient, InventoryUom, PaymentType, StockMovementType, StockReferenceType } from '@prisma/client'
import { generateOrderId } from '../lib/utils/id-utils'

import { createHash } from 'node:crypto';

const prisma = new PrismaClient()

// Deterministic ID based on email for session persistence
function getDeterministicId(email: string): string {
  const hash = createHash('md5').update(email).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

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
  const adminEmail = 'admin@tiamac.id';
  const admin = await prisma.user.create({
    data: { 
      id: getDeterministicId(adminEmail),
      name: 'Admin TIAMAC', 
      email: adminEmail, 
      password: 'pass1234', 
      status: 'ACTIVE' 
    },
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
      data: { 
        id: getDeterministicId(t.email),
        name: t.name, 
        email: t.email, 
        password: 'pass1234', 
        status: 'ACTIVE' 
      }
    });
    await prisma.staffProfile.create({
      data: { userId: user.id, role: 'teknisi', no_telp: '0812' + Math.floor(Math.random()*100000000), wilayah: t.wilayah }
    });
    createdTeknisi.push(user);
  }
  const masterTeknisi = createdTeknisi[0];

  // 3. CUSTOMERS (A lot more)
  const customerList = [
    { name: 'Dina Pratiwi', email: 'dina@customer.id', alamat: 'Jl. Meruya Utara No. 10, Jakarta Barat' },
    { name: 'Sari Wijaya', email: 'sari@customer.id', alamat: 'Apartemen Green Park Tower B Lt. 12, Jakarta Pusat' },
    { name: 'Rama Pratama', email: 'rama@customer.id', alamat: 'Kavling DKI Blok C-9, Pondok Kelapa, Jakarta Timur' },
    { name: 'Eka Santoso', email: 'eka@customer.id', alamat: 'Jl. Kebon Jeruk No. 45, Jakarta Barat' },
    { name: 'Fani Lestari', email: 'fani@customer.id', alamat: 'Perum Puri Beta 2 Blok D-11, Ciledug, Tangerang' },
    { name: 'Gani Hermawan', email: 'gani@customer.id', alamat: 'Jl. Joglo Raya No. 88, Jakarta Barat' },
    { name: 'Hani Susanti', email: 'hani@customer.id', alamat: 'Ciledug Indah 1 No. 23, Tangerang' },
    { name: 'Indra Jaya', email: 'indra@customer.id', alamat: 'Villa Meruya Blok F-1 No. 5, Jakarta Barat' },
    { name: 'Junaidi', email: 'juna@customer.id', alamat: 'Jl. Palmerah Barat No. 2, Jakarta Selatan' },
    { name: 'Kania Putri', email: 'kania@customer.id', alamat: 'Jl. Grogol Indah No. 14, Jakarta Barat' },
  ];

  const jakartaRegions = ['Jakarta Barat', 'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Utara'];
  const createdCustomers = [];
  for (const [idx, c] of customerList.entries()) {
    const user = await prisma.user.create({
      data: { 
        id: getDeterministicId(c.email),
        name: c.name, 
        email: c.email, 
        password: 'pass1234', 
        status: 'ACTIVE' 
      }
    });
    await prisma.customerProfile.create({
      data: { 
        userId: user.id, 
        no_telp: '0855' + Math.floor(Math.random()*100000000), 
        alamat: c.alamat, 
        provinsi: jakartaRegions[idx % jakartaRegions.length] 
      }
    });
    createdCustomers.push(user);
  }
  const masterCustomer = createdCustomers[0];

  // 4. SERVICE CATALOG & INVENTORY (Same as before)
  await prisma.acServiceCatalog.createMany({
    data: [
      // FLAT PRICES
      { nama: 'Bongkar', pk: null, harga: 150000 },
      { nama: 'Pasang', pk: null, harga: 250000 },
      { nama: 'Bongkar + Pasang', pk: null, harga: 375000 },
      { nama: 'Las Kebocoran + Isi Freon', pk: null, harga: 550000 },

      // TIERED PRICES: 0.5 PK
      { nama: 'Cuci AC', pk: '0.5', harga: 75000 },
      { nama: 'Vaccum AC', pk: '0.5', harga: 100000 },
      { nama: 'Tambah Freon', pk: '0.5', harga: 150000 },
      { nama: 'Tambah Freon R32/R410', pk: '0.5', harga: 200000 },
      { nama: 'Isi Freon R22', pk: '0.5', harga: 250000 },
      { nama: 'Isi Freon R32/R410', pk: '0.5', harga: 350000 },
      { nama: 'Pergantian Kapasitor', pk: '0.5', harga: 150000 },

      // TIERED PRICES: 1 PK
      { nama: 'Cuci AC', pk: '1', harga: 85000 },
      { nama: 'Vaccum AC', pk: '1', harga: 125000 },
      { nama: 'Tambah Freon', pk: '1', harga: 175000 },
      { nama: 'Tambah Freon R32/R410', pk: '1', harga: 250000 },
      { nama: 'Isi Freon R22', pk: '1', harga: 300000 },
      { nama: 'Isi Freon R32/R410', pk: '1', harga: 450000 },
      { nama: 'Pergantian Kapasitor', pk: '1', harga: 180000 },

      // TIERED PRICES: 1.5-2 PK
      { nama: 'Cuci AC', pk: '1.5-2', harga: 100000 },
      { nama: 'Vaccum AC', pk: '1.5-2', harga: 150000 },
      { nama: 'Tambah Freon', pk: '1.5-2', harga: 250000 },
      { nama: 'Tambah Freon R32/R410', pk: '1.5-2', harga: 350000 },
      { nama: 'Isi Freon R22', pk: '1.5-2', harga: 400000 },
      { nama: 'Isi Freon R32/R410', pk: '1.5-2', harga: 550000 },
      { nama: 'Pergantian Kapasitor', pk: '1.5-2', harga: 250000 },
    ],
  });
  const catalog = await prisma.acServiceCatalog.findMany();
  const getCatalog = (nama: string, pk: string | null = '1') => catalog.find(c => c.nama === nama && (c.pk === pk || c.pk === null));

  // 4.1 INVENTORY ITEMS — Comprehensive AC spare parts & consumables
  await prisma.inventoryItem.createMany({
    data: [
      // === FREON / REFRIGERANT ===
      { sku: 'FREON-R32-1KG',    nama: 'Freon R32 (1 kg)',        uom: 'tabung', harga: 250000, qtyOnHand: 50, minStock: 5 },
      { sku: 'FREON-R410-1KG',   nama: 'Freon R410A (1 kg)',      uom: 'tabung', harga: 280000, qtyOnHand: 40, minStock: 5 },
      { sku: 'FREON-R22-1KG',    nama: 'Freon R22 (1 kg)',        uom: 'tabung', harga: 220000, qtyOnHand: 30, minStock: 5 },
      { sku: 'FREON-R32-10KG',   nama: 'Freon R32 (10 kg)',       uom: 'tabung', harga: 2100000, qtyOnHand: 10, minStock: 2 },
      { sku: 'FREON-R410-10KG',  nama: 'Freon R410A (10 kg)',     uom: 'tabung', harga: 2400000, qtyOnHand: 8,  minStock: 2 },

      // === KAPASITOR ===
      { sku: 'KAPS-25UF',        nama: 'Kapasitor 25 µF',         uom: 'pcs', harga: 35000,  qtyOnHand: 80, minStock: 10 },
      { sku: 'KAPS-35UF',        nama: 'Kapasitor 35 µF',         uom: 'pcs', harga: 45000,  qtyOnHand: 80, minStock: 10 },
      { sku: 'KAPS-45UF',        nama: 'Kapasitor 45 µF',         uom: 'pcs', harga: 55000,  qtyOnHand: 60, minStock: 10 },
      { sku: 'KAPS-DUAL-35-5UF', nama: 'Kapasitor Dual 35+5 µF',  uom: 'pcs', harga: 75000,  qtyOnHand: 50, minStock: 5  },

      // === FAN MOTOR ===
      { sku: 'MOTOR-IND-1PK',    nama: 'Motor Fan Indoor 1 PK',   uom: 'pcs', harga: 350000,  qtyOnHand: 20, minStock: 3 },
      { sku: 'MOTOR-IND-15PK',   nama: 'Motor Fan Indoor 1.5 PK', uom: 'pcs', harga: 420000,  qtyOnHand: 15, minStock: 2 },
      { sku: 'MOTOR-OUT-1PK',    nama: 'Motor Fan Outdoor 1 PK',  uom: 'pcs', harga: 480000,  qtyOnHand: 15, minStock: 2 },
      { sku: 'MOTOR-OUT-15PK',   nama: 'Motor Fan Outdoor 1.5 PK',uom: 'pcs', harga: 550000,  qtyOnHand: 10, minStock: 2 },

      // === PCB / MODUL ===
      { sku: 'PCB-IND-UNIV',     nama: 'PCB Indoor Universal',    uom: 'pcs', harga: 250000,  qtyOnHand: 25, minStock: 3 },
      { sku: 'PCB-OUT-UNIV',     nama: 'PCB Outdoor Universal',   uom: 'pcs', harga: 350000,  qtyOnHand: 20, minStock: 3 },
      { sku: 'PCB-INVERTER',     nama: 'Modul Inverter Board',    uom: 'pcs', harga: 750000,  qtyOnHand: 10, minStock: 2 },

      // === THERMISTOR / SENSOR ===
      { sku: 'SENSOR-ROOM',      nama: 'Thermistor Room Sensor',  uom: 'pcs', harga: 45000,   qtyOnHand: 50, minStock: 5 },
      { sku: 'SENSOR-PIPE',      nama: 'Thermistor Pipe Sensor',  uom: 'pcs', harga: 55000,   qtyOnHand: 50, minStock: 5 },

      // === PIPA & FITTING ===
      { sku: 'PIPA-14-1M',       nama: 'Pipa Tembaga 1/4" (1 m)', uom: 'meter', harga: 35000, qtyOnHand: 200, minStock: 20 },
      { sku: 'PIPA-38-1M',       nama: 'Pipa Tembaga 3/8" (1 m)', uom: 'meter', harga: 55000, qtyOnHand: 150, minStock: 20 },
      { sku: 'PIPA-12-1M',       nama: 'Pipa Tembaga 1/2" (1 m)', uom: 'meter', harga: 75000, qtyOnHand: 100, minStock: 10 },
      { sku: 'PIPA-ISOLASI-1M',  nama: 'Insulasi Pipa (1 m)',     uom: 'meter', harga: 12000, qtyOnHand: 300, minStock: 30 },

      // === FILTER & KEBERSIHAN ===
      { sku: 'FILTER-INDOOR',    nama: 'Filter Indoor AC',        uom: 'pcs', harga: 35000,   qtyOnHand: 100, minStock: 10 },
      { sku: 'COIL-CLEANER',     nama: 'Coil Cleaner Spray',      uom: 'pcs', harga: 55000,   qtyOnHand: 60,  minStock: 10 },
      { sku: 'AC-FOAM-CLEANER',  nama: 'AC Foam Cleaner 500ml',   uom: 'pcs', harga: 45000,   qtyOnHand: 80,  minStock: 10 },
      { sku: 'LAP-MICROFIBER',   nama: 'Lap Microfiber 40x40 cm', uom: 'pcs', harga: 15000,   qtyOnHand: 200, minStock: 20 },

      // === SEALANT & ADHESIVE ===
      { sku: 'SEALANT-PIPA',     nama: 'Epoxy Sealant Pipa',      uom: 'pcs', harga: 65000,   qtyOnHand: 40, minStock: 5 },
      { sku: 'DUCT-TAPE',        nama: 'Aluminium Duct Tape',     uom: 'roll', harga: 25000,   qtyOnHand: 50, minStock: 5 },

      // === KABEL & KONEKTOR ===
      { sku: 'KABEL-AC-3X15',    nama: 'Kabel Power AC 3x1.5mm (1m)', uom: 'meter', harga: 18000, qtyOnHand: 200, minStock: 20 },
      { sku: 'KONEKTOR-PUSH',    nama: 'Push Connector Set',      uom: 'set',   harga: 25000,  qtyOnHand: 100, minStock: 10 },

      // === DRAINASE ===
      { sku: 'SELANG-DRAIN-1M',  nama: 'Selang Drain 3/4" (1m)', uom: 'meter', harga: 8000,   qtyOnHand: 300, minStock: 30 },
      { sku: 'DRAIN-PAN-TABLET', nama: 'Drain Pan Tablet (10 pcs)', uom: 'set', harga: 30000,  qtyOnHand: 80,  minStock: 10 },
    ],
    skipDuplicates: true,
  });

  // Retrieve items for use in service creation
  const freon     = await prisma.inventoryItem.findUniqueOrThrow({ where: { sku: 'FREON-R32-1KG' } });
  const kapasitor = await prisma.inventoryItem.findUniqueOrThrow({ where: { sku: 'KAPS-35UF' } });

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

  // Daftar alamat servis untuk seed (dirotasi per service)
  const alamatServisList = [
    'Jl. Meruya Utara No. 10, Jakarta Barat',
    'Apartemen Green Park Tower B Lt. 12, Jakarta Pusat',
    'Kavling DKI Blok C-9, Pondok Kelapa, Jakarta Timur',
    'Jl. Kebon Jeruk No. 45, Jakarta Barat',
    'Perum Puri Beta 2 Blok D-11, Ciledug, Tangerang',
    'Jl. Joglo Raya No. 88, Jakarta Barat',
    'Ciledug Indah 1 No. 23, Tangerang',
    'Villa Meruya Blok F-1 No. 5, Jakarta Barat',
    'Jl. Palmerah Barat No. 2, Jakarta Selatan',
    'Jl. Grogol Indah No. 14, Jakarta Barat',
    'Jl. Puri Indah Raya Blok S-2, Jakarta Barat',
    'Ruko Taman Palem No. 7, Cengkareng, Jakarta Barat',
    'Jl. Daan Mogot KM 14, Tangerang',
    'Komplek Taman Aries Blok J3, Jakarta Barat',
    'Jl. Kapuk Raya No. 100, Jakarta Utara',
    'Perumahan Modernland Blok AA-12, Tangerang',
    'Jl. Bintaro Utama Sektor 5, Tangerang Selatan',
    'Jl. H. Nawi No. 33, Jakarta Selatan',
    'Apartemen Kalibata City Tower Ebony Lt. 8, Jakarta Selatan',
    'Jl. Raya Bekasi Timur No. 55, Jakarta Timur',
    'Jl. Tebet Barat Dalam No. 12, Jakarta Selatan',
    'Taman Kota Mas Blok B2 No. 9, Jakarta Utara',
    'Jl. Pluit Karang Utara No. 3, Jakarta Utara',
    'Komplek Perumahan Taman Waringin, Bogor',
    'Jl. Raya Serpong No. 77, Tangerang Selatan',
    'Jl. BSD Sektor XIV Blok G-3, Tangerang Selatan',
    'Ruko Grand Serpong Walk No. 11, Tangerang'
  ];

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
      unitSpecs.push({ pk: "1.0", layanan: services, total: unitTotal });
      totalLayanan += unitTotal;
    }
    const materialPrice = (statusIndex >= 4 && status !== 'Dibatalkan') ? (freon.harga + kapasitor.harga) : 0;
    const calculatedTotal = BIAYA_DASAR + totalLayanan + materialPrice;

    const serviceId = generateOrderId();
    // Rotasi alamat servis berdasarkan index global
    const alamatServis = alamatServisList[(ALUR_SERVIS.findIndex(s => s.value === status) * 3 + index) % alamatServisList.length];
    const service = await prisma.services.create({
      data: {
        id: serviceId,
        customerId: masterCustomer.id, teknisiId: isPastCheck ? masterTeknisi.id : null, jenis_servis: 'AC',
        keluhan: `Perbaikan ${unitCount} Unit AC #${index + 1}\nLokasi: Lantai ${index + 1}\nGejala: Tidak Dingin`,
        status, status_servis: status, biaya_dasar: BIAYA_DASAR,
        alamat_servis: alamatServis,
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
    // 5.1 Payments Logic based on alur.md
    const dpStatus = (statusIndex >= 1 && status !== 'Dibatalkan') ? 'PAID' : 'PENDING';
    
    // Create DP Payment
    await prisma.servicePayment.create({
      data: {
        serviceId: service.id,
        type: PaymentType.DOWN_PAYMENT,
        amount: BIAYA_DASAR,
        status: dpStatus,
        metodePembayaran: dpStatus === 'PAID' ? 'qris' : null,
        bank: dpStatus === 'PAID' ? 'QRIS' : null,
        vaNumber: dpStatus === 'PAID' ? 'QR' + Math.floor(10000000 + Math.random() * 90000000) : null,
        waktuPembayaran: dpStatus === 'PAID' ? new Date(Date.now() - 2 * 24 * 3600000) : null,
      }
    });

    // Create Full Payment for stages: Perbaikan Unit, Menunggu Pembayaran, Selesai
    if (statusIndex >= 5 && status !== 'Dibatalkan') {
      const isPaid = status === 'Selesai (Garansi Aktif)';
      const fullStatus = isPaid ? 'PAID' : 'PENDING';
      
      await prisma.servicePayment.create({
        data: {
          serviceId: service.id,
          type: PaymentType.FULL_PAYMENT,
          amount: calculatedTotal - BIAYA_DASAR,
          status: fullStatus,
          metodePembayaran: fullStatus === 'PAID' ? 'bank_transfer' : null,
          bank: fullStatus === 'PAID' ? 'bca' : null,
          vaNumber: '8801' + Math.floor(10000000 + Math.random() * 90000000),
          waktuPembayaran: fullStatus === 'PAID' ? new Date(Date.now() - 3600000) : null,
          expiryTime: fullStatus === 'PENDING' ? new Date(Date.now() + 24 * 3600000) : null,
        }
      });
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
