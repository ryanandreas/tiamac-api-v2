import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const technicians = await db.staffProfile.findMany({
      include: {
        user: { select: { uuid: true, name: true, email: true } }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Technicians fetched successfully",
      data: technicians
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch technicians"
    }, { status: 500 });
  }
}
