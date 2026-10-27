import { NextResponse, type NextRequest } from 'next/server';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, verifyPassword } from '@/lib/server/auth';

const attempts = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

function clientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter(timestamp => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(ip, recent);
    return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'Cache-Control': 'no-store' } });
  }
  recent.push(now);
  attempts.set(ip, recent);

  let password: unknown;
  try {
    password = (await request.json() as { password?: unknown }).password;
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  if (typeof password !== 'string') {
    return NextResponse.json({ error: 'invalid_password' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    if (!verifyPassword(password)) {
      return NextResponse.json({ error: 'invalid_password' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }
    const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(SESSION_COOKIE, createSessionToken(now), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'auth_not_configured' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
