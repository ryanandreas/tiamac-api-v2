import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await AuthService.validateUser(body);
    await AuthService.updateLastLogin(user.id);

    // Return the user data and we expect the client (like Flutter) 
    // to handle session or we can also provide a JWT in future.
    // For now, we follow the current session structure.
    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.staffProfile ? "staff" : "customer",
        role: user.staffProfile?.role,
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Invalid credentials"
    }, { status: 401 });
  }
}
