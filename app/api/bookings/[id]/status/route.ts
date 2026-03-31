import { NextResponse } from "next/server";
import { ServiceRequestService } from "@/lib/services/service-request-service"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: serviceId } = await params;
    const body = await req.json();
    const { status, status_servis } = body;

    if (!status) throw new Error("Status is required");

    await ServiceRequestService.updateStatus(serviceId, status, status_servis);

    return NextResponse.json({ 
      success: true, 
      message: "Service status updated successfully" 
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update status"
    }, { status: 400 });
  }
}
