// ============================================================================
// C-Spot Academy — Admin Authentication & HTTP-Only Cookie Session Helper
// File: src/lib/auth.ts
// ============================================================================

import { cookies } from 'next/headers';
import { verifyAdminSessionToken, type AdminSessionPayload } from './tokens';

export const ADMIN_COOKIE_NAME = 'cspot_admin_session';

export async function getAuthenticatedAdmin(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyAdminSessionToken(token);
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const configuredPassword =
    process.env.ADMIN_ACCESS_PASSWORD || 'cspot_admin_2026_secure';

  if (!email || !email.includes('@')) return false;
  return password.trim() === configuredPassword.trim();
}
