import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user.isAuthenticated) {
      return NextResponse.json({
        success: false,
        message: "Not authenticated",
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        profile: {
          no_telp: (user as any).profile?.no_telp || "",
          alamat: (user as any).profile?.alamat || "",
          provinsi: (user as any).profile?.provinsi || "",
        }
      }
    });


  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch session"
    }, { status: 500 });
  }
}
