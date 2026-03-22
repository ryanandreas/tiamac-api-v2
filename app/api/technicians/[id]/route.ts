import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: userId } = await params;
    
    const technician = await db.staffProfile.findFirst({
      where: {
        userId: userId,
        role: { in: ["Teknisi", "Karyawan", "teknisi", "karyawan"] } // Assuming role case varies
      },
      include: {
        user: {
          select: {
            uuid: true,
            name: true,
            email: true,
            status: true,
            lastLogin: true,
            createdAt: true
          }
        }
      }
    });

    if (!technician) {
      return NextResponse.json({
        success: false,
        message: "Technician not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Technician details fetched successfully",
      data: technician
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch technician details"
    }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: userId } = await params;
    const body = await req.json();

    const technician = await db.staffProfile.update({
      where: { userId: userId },
      data: body,
      include: {
        user: {
          select: {
            uuid: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Technician profile updated successfully",
      data: technician
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update technician"
    }, { status: 400 });
  }
}
