import { NextResponse } from "next/server";
import { UserService } from "@/lib/services/user-service";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const user = await UserService.getCustomerById(id);

    if (!user) return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.customerProfile
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch customer profile"
    }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await req.json();

    await UserService.updateProfile(id, body);

    return NextResponse.json({
      success: true,
      message: "Customer profile updated successfully"
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update profile"
    }, { status: 400 });
  }
}
