import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: technicianId } = await params;

    const assignments = await db.services.findMany({
      where: {
        teknisiId: technicianId,
        status_servis: {
          notIn: ["Selesai", "Selesai (Garansi Aktif)", "Dibatalkan"]
        }
      },
      include: {
        customer: true,
        acUnits: { include: { layanan: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      message: "Technician assignments fetched successfully",
      data: assignments
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch technician assignments"
    }, { status: 500 });
  }
}
