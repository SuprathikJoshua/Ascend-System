import { NextResponse, type NextRequest } from 'next/server';
import { isValidSessionToken, SESSION_COOKIE } from '@/lib/server/auth';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === '/login' || pathname === '/api/login') return NextResponse.next();

  let authenticated = false;
  try {
    authenticated = isValidSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  } catch {
    authenticated = false;
  }

  if (authenticated) return NextResponse.next();
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)'],
};
