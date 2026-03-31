import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

    // Check for transitional manual cookies during migration
    const userId = request.cookies.get("userId")?.value;

	if (!session && !userId) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
    
	return NextResponse.next();
}

export const config = {
	matcher: [
        "/dashboard/:path*", 
        "/customer-panel/:path*",
    ],
};
