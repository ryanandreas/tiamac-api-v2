import { NextResponse } from "next/server";
import { TechnicianService } from "@/lib/services/technician-service";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: serviceId } = await params;
    const formData = await req.formData();
    const before = formData.get("before") as File;
    const after = formData.get("after") as File;
    const technicianId = formData.get("technicianId") as string;

    if (!before || !after || !technicianId) {
        throw new Error("Missing required fields (before, after, technicianId)");
    }

    await TechnicianService.uploadBukti({
      serviceId,
      before,
      after,
      technicianId,
    });

    return NextResponse.json({ success: true, message: "Proof uploaded successfully" });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to upload proof"
    }, { status: 400 });
  }
}
