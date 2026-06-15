import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Define protected dashboard tabs
  const protectedPaths = [
    '/dashboard',
    '/reports',
    '/saved-scenarios',
    '/my-plans',
    '/settings'
  ];

  const authPaths = ['/login', '/signup'];

  const isGuest = request.cookies.get('siplytics-guest-mode')?.value === 'true';
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + '/'));
  const isAuthPath = authPaths.some((path) => pathname === path || pathname.startsWith(path + '/'));

  // 1. Redirect unauthenticated users without active guest sessions to Login
  if (isProtected && !user && !isGuest) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Redirect logged-in members attempting to visit Auth pages back to Dashboard
  if (isAuthPath && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/assets (public graphics)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
