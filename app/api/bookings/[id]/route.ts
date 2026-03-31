import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TechnicianService } from "@/lib/services/technician-service";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const service = await db.services.findUnique({
      where: { id },
      include: {
        customer: true,
        teknisi: true,
        acUnits: { include: { layanan: true } },
        materialUsages: { include: { item: true } }
      }
    });

    if (!service) return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: "Booking details fetched successfully",
      data: service
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch booking details"
    }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: serviceId } = await params;
    const body = await req.json();
    const { technicianId, action, ...data } = body;

    // Handle technician actions if present in PUT body
    if (action === "start") {
      await TechnicianService.startPengecekan(serviceId, technicianId);
      return NextResponse.json({ success: true, message: "Service diagnostic started" });
    }

    if (action === "submitReport") {
      const { diagnosa, jasaTambahan } = body;
      await TechnicianService.submitPengecekan({
        serviceId,
        diagnosa,
        jasaTambahan: Number(jasaTambahan),
        technicianId,
      });
      return NextResponse.json({ success: true, message: "Report submitted successfully" });
    }

    // Default update logic
    const service = await db.services.update({
      where: { id: serviceId },
      data
    });

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      data: service
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update booking"
    }, { status: 400 });
  }
}
