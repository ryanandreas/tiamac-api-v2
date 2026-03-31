import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const inventory = await db.inventoryItem.findMany({
      where: { qtyOnHand: { gt: 0 } },
      orderBy: { nama: "asc" }
    });

    return NextResponse.json({
      success: true,
      data: inventory
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch inventory"
    }, { status: 500 });
  }
}
