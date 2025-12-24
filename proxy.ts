import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

// Protected routes that require authentication
const protectedRoutes = [/^\/dashboard(\/.*)?$/];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((regex) => regex.test(pathname));
}

function isAuthPage(pathname: string): boolean {
  return pathname === "/login" || pathname === "/signup";
}

// Get token from cookies (for page requests) or Authorization header (for API requests)
function getTokenFromRequest(request: NextRequest): string | null {
  // First try to get from cookie (for page navigation)
  const cookieToken = request.cookies.get("auth_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to Authorization header (for API requests)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  // Get token from request
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  console.log("verifyToken", verifyToken(token || ""));
  console.log("token", token);
  console.log("payload", payload);

  // Handle auth pages (login/signup)
  if (isAuthPage(pathname)) {
    // If user is already authenticated, redirect to dashboard
    if (payload) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    // Allow access to auth pages for unauthenticated users
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    // If not authenticated, redirect to login
    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Allow access to protected routes for authenticated users
    return NextResponse.next();
  }

  // Allow all other routes
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
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
