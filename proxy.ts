import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Auth routes (pages like login/register that authenticated users shouldn't see)
    const authRoutes = ["/login", "/register", "/forgot-password"];
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // Public routes that don't require authentication, but authenticated users can still access
    const publicRoutes = ["/", "/chatbot"];
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));

    const isAdminRoute = pathname.startsWith("/admin");

    // Get auth token from cookies (backend sets "auth" or "jwt")
    const tokenCookie = request.cookies.get("auth") || request.cookies.get("jwt");
    let isAuthenticated = false;
    let userRole: string | null = null;

    if (tokenCookie?.value && tokenCookie.value !== "loggedout") {
        try {
            // A JWT has 3 parts: header.payload.signature
            const parts = tokenCookie.value.split(".");
            if (parts.length === 3) {
                const payloadStr = atob(parts[1]);
                const payload = JSON.parse(payloadStr);

                // Check token expiration if present (exp is in seconds)
                if (payload?.exp && payload.exp * 1000 < Date.now()) {
                    isAuthenticated = false;
                } else {
                    isAuthenticated = true;
                    userRole = payload?.role || null;
                }
            }
        } catch (error) {
            console.error("Error decoding token in middleware:", error);
            isAuthenticated = false;
        }
    }

    // Redirect to login if trying to access protected route without authentication
    if (!isPublicRoute && !isAuthRoute && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If accessing admin routes, ensure role is ADMIN
    if (isAdminRoute && isAuthenticated && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Redirect to home if trying to access auth pages while already authenticated
    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL(userRole === "ADMIN" ? "/admin" : "/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images).*)",
    ],
};