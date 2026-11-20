// ============================================================================
// C-Spot Academy — Cryptographic Access Tokens, Admin JWTs & OTP Hashing
// File: src/lib/tokens.ts
// ============================================================================

import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

const FALLBACK_DEV_SECRET = 'cspot-academy-local-dev-secret-change-in-production-2026';

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.startsWith('replace_with_')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL: JWT_SECRET must be configured in production.');
    }
    return new TextEncoder().encode(FALLBACK_DEV_SECRET);
  }
  return new TextEncoder().encode(secret);
}

export function generateAccessNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export interface WorkshopAccessTokenPayload {
  sub: string;
  workshopId: string;
  registrationCode: string;
  nonce: string;
  purpose: 'WORKSHOP_ACCESS';
}

export async function signWorkshopAccessToken(params: {
  registrationId: string;
  workshopId: string;
  registrationCode: string;
  nonce: string;
}): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({
    workshopId: params.workshopId,
    registrationCode: params.registrationCode,
    nonce: params.nonce,
    purpose: 'WORKSHOP_ACCESS',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(params.registrationId)
    .setIssuedAt()
    .setIssuer('c-spot-academy')
    .setExpirationTime('30d')
    .sign(secretKey);
}

export async function verifyWorkshopAccessToken(
  token: string
): Promise<WorkshopAccessTokenPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: 'c-spot-academy',
    });

    if (
      payload.purpose !== 'WORKSHOP_ACCESS' ||
      typeof payload.sub !== 'string' ||
      typeof payload.workshopId !== 'string' ||
      typeof payload.registrationCode !== 'string' ||
      typeof payload.nonce !== 'string'
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      workshopId: payload.workshopId,
      registrationCode: payload.registrationCode,
      nonce: payload.nonce,
      purpose: 'WORKSHOP_ACCESS',
    };
  } catch {
    return null;
  }
}

export interface AdminSessionPayload {
  email: string;
  role: string;
  purpose: 'ADMIN_SESSION';
}

export async function signAdminSessionToken(
  email: string,
  role = 'SUPER_ADMIN'
): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({
    email,
    role,
    purpose: 'ADMIN_SESSION',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(email)
    .setIssuedAt()
    .setIssuer('c-spot-academy')
    .setExpirationTime('12h')
    .sign(secretKey);
}

export async function verifyAdminSessionToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: 'c-spot-academy',
    });

    if (
      payload.purpose !== 'ADMIN_SESSION' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      return null;
    }

    return {
      email: payload.email,
      role: payload.role,
      purpose: 'ADMIN_SESSION',
    };
  } catch {
    return null;
  }
}
