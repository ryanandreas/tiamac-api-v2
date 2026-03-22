import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const catalog = await db.acServiceCatalog.findMany({
      orderBy: { nama: "asc" }
    });

    return NextResponse.json({
      success: true,
      message: "Services fetched successfully",
      data: catalog
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch services"
    }, { status: 500 });
  }
}
