import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const locations = await db.customerProfile.findMany({
      where: {
        alamat: {
          not: null,
        },
      },
      select: { alamat: true },
      distinct: ["alamat"],
    });

    return NextResponse.json({
      success: true,
      message: "Locations fetched successfully",
      data: locations.map((l) => l.alamat).filter(Boolean),
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch locations"
    }, { status: 500 });
  }
}
