import { NextRequest, NextResponse } from 'next/server';

// Basic role-gate example — expand per route group as panels are built.
const roleProtectedPrefixes: Record<string, string> = {
  '/buyer': 'BUYER',
  '/seller': 'SELLER',
  '/admin': 'ADMIN',
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const matchedPrefix = Object.keys(roleProtectedPrefixes).find((p) => pathname.startsWith(p));
  if (!matchedPrefix) return NextResponse.next();

  const token = req.cookies.get('access_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/buyer/:path*', '/seller/:path*', '/admin/:path*'],
};
