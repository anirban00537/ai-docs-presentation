import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes (especially auth routes)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check for session cookie existence (optimistic check)
  // Note: This only checks if cookie exists, not if it's valid
  // The protected layout will do the actual validation
  const sessionCookie = getSessionCookie(request);

  // Redirect authenticated users away from login page
  if (sessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Let the protected layout handle authentication checks
  // This avoids blocking requests and allows cookies to be set properly
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
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
