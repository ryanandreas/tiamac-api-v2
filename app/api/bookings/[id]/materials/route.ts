import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TechnicianService } from "@/lib/services/technician-service";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: serviceId } = await params;
    const materials = await db.serviceMaterialUsage.findMany({
      where: { serviceId },
      include: { item: true }
    });

    return NextResponse.json({
      success: true,
      message: "Materials list fetched",
      data: materials
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch materials"
    }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: serviceId } = await params;
    const body = await req.json();
    const { itemId, qty, notes, technicianId } = body;

    await TechnicianService.addMaterialUsage({
      serviceId,
      itemId,
      qty: Number(qty),
      notes,
      technicianId,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Material usage added successfully" 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to add material usage"
    }, { status: 400 });
  }
}
