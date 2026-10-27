import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'prep_session';
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error('AUTH_SECRET is not configured');
  return value;
}

export function verifyPassword(candidate: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) throw new Error('APP_PASSWORD is not configured');
  const candidateDigest = createHash('sha256').update(candidate).digest();
  const expectedDigest = createHash('sha256').update(expected).digest();
  return timingSafeEqual(candidateDigest, expectedDigest);
}

export function createSessionToken(now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ expiresAt: now + SESSION_MAX_AGE_SECONDS * 1000 })).toString('base64url');
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function isValidSessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const separator = token.lastIndexOf('.');
  if (separator <= 0) return false;
  const payload = token.slice(0, separator);
  const providedSignature = token.slice(separator + 1);
  const expectedSignature = createHmac('sha256', secret()).update(payload).digest();
  let payloadValue: unknown;
  try {
    const provided = Buffer.from(providedSignature, 'base64url');
    if (provided.length !== expectedSignature.length) return false;
    if (!timingSafeEqual(provided, expectedSignature)) return false;
    payloadValue = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return false;
  }
  return typeof payloadValue === 'object' && payloadValue !== null &&
    typeof (payloadValue as { expiresAt?: unknown }).expiresAt === 'number' &&
    (payloadValue as { expiresAt: number }).expiresAt > now;
}
