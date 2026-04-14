import { db } from "@/lib/db";
import { generateOrderId } from "@/lib/utils/id-utils";
import { CreateBookingSchema, CreateBookingInput } from "@/lib/validations/schemas";

export const BASE_VISIT_FEE = 50000;

export class BookingService {
  static async createBooking(input: CreateBookingInput) {
    // 1. Validation Layer (Zod)
    const validation = CreateBookingSchema.safeParse(input);
    if (!validation.success) {
      throw new Error(validation.error.issues[0]?.message || "Input tidak valid");
    }

    const { customerId, units, keluhan, alamat, jadwalTanggal } = validation.data;

    if (!customerId) throw new Error("Customer ID diperlukan untuk membuat pesanan.");

    // 2. Fetch catalog and business logic
    const layananNames = Array.from(new Set(units.flatMap((u) => u.layanan)));
    const catalogRows = await db.acServiceCatalog.findMany({
      where: { nama: { in: layananNames } },
      select: { uuid: true, nama: true, pk: true, harga: true },
    });
    
    // Build Index for fast lookup
    const catalogIdx: any = {};
    for (const row of catalogRows) {
        if (!catalogIdx[row.nama]) catalogIdx[row.nama] = { byPk: {} };
        if (row.pk) catalogIdx[row.nama].byPk[row.pk] = row;
        else catalogIdx[row.nama].default = row;
    }

    let totalLayanan = 0;
    const unitsData = units.map((unit) => {
      const unitLayananData = unit.layanan.map((name) => {
        const item = catalogIdx[name];
        const entry = item ? (item.byPk[String(unit.pk)] ?? item.default) : null;
        
        if (!entry) throw new Error(`Harga layanan "${name}" untuk PK ${unit.pk} belum tersedia.`);
        totalLayanan += entry.harga;
        return { nama: name, harga: entry.harga, catalogId: entry.uuid };
      });

      return {
        pk: unit.pk,
        layanan: unitLayananData,
      };
    });

    const estimasiTotal = BASE_VISIT_FEE + totalLayanan;

    // 3. Prepare display text (Business Logic)
    const layananLines = unitsData.map((u, i) => {
      const detailText = u.layanan.map((l) => `${l.nama}`).join(", ");
      return `AC ${i + 1}: PK ${u.pk} | Layanan: ${detailText}`;
    });

    const keluhanGabungan = [
      keluhan,
      "",
      ...layananLines,
      `Total Estimasi: Rp ${estimasiTotal.toLocaleString("id-ID")}`,
      "",
      `Alamat: ${alamat}`,
      `Jadwal: ${jadwalTanggal}`,
    ].join("\n");

    // 4. DB creation
    const serviceId = generateOrderId();
    
    return db.$transaction(async (tx) => {
      const service = await tx.services.create({
        data: {
          id: serviceId,
          customerId,
          jenis_servis: "AC",
          keluhan: keluhanGabungan,
          status: "Booking",
          status_servis: "Booking",
          biaya_dasar: BASE_VISIT_FEE,
          estimasi_biaya: estimasiTotal,
          acUnits: {
            create: unitsData.map((u) => ({
              pk: u.pk,
              layanan: {
                create: u.layanan.map((l) => ({
                  nama: l.nama,
                  harga: l.harga,
                  catalogId: l.catalogId,
                })),
              },
            })),
          },
        },
        include: {
          acUnits: true
        }
      });

      await tx.serviceStatusHistory.create({
        data: {
          serviceId: service.id,
          status: "Booking",
          status_servis: "Booking",
          changedByUserId: customerId,
          notes: "Pesanan baru dibuat oleh customer",
        },
      });

      return service;
    });
  }

  static async getServiceDetail(id: string) {
    return db.services.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            customerProfile: true,
          },
        },
        teknisi: {
          select: {
            id: true,
            name: true,
          },
        },
        acUnits: {
          include: {
            layanan: true,
          },
        },
        materialUsages: {
          include: {
            item: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }
}

