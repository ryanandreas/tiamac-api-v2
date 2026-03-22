import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BookingService } from "@/lib/services/booking-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const technicianId = searchParams.get("technicianId");
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (technicianId) where.teknisiId = technicianId;
    if (customerId) where.customerId = customerId;

    const services = await db.services.findMany({
      where,
      include: {
        customer: true,
        teknisi: true,
        acUnits: { include: { layanan: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      message: "Bookings fetched successfully",
      data: services
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch services"
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const service = await BookingService.createBooking(body);

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      data: service
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to create booking"
    }, { status: 400 });
  }
}
