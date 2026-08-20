import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'access_token'; // Backend JWT cookie name
const PUBLIC_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Note: We don't verify the JWT here. We just check if the cookie exists.
  // The actual verification happens on the backend during the /auth/me call or any protected API call.

  if (!hasAuthCookie && !isPublicRoute) {
    // Redirect unauthenticated users trying to access protected routes to login
    const loginUrl = new URL('/login', request.url);
    // Optional: add a returnUrl query param
    // loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasAuthCookie && isPublicRoute) {
    // Redirect authenticated users trying to access login/register to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
