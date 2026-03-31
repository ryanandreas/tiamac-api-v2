import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: customerId } = await params;

    const services = await db.services.findMany({
      where: { customerId },
      include: {
        acUnits: { include: { layanan: true } },
        teknisi: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      message: "Customer services fetched successfully",
      data: services
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch customer services"
    }, { status: 500 });
  }
}
