import { NextResponse } from "next/server";
import { ServiceRequestService } from "@/lib/services/service-request-service"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: serviceId } = await params;
    const body = await req.json();
    const { teknisiId, jadwalTanggal } = body;

    if (!teknisiId || !jadwalTanggal) {
        throw new Error("Missing required technician or date");
    }

    await ServiceRequestService.updateSchedule({
      serviceId,
      teknisiId,
      jadwalTanggal,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Service schedule updated successfully" 
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update schedule"
    }, { status: 400 });
  }
}
