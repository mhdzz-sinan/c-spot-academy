// ============================================================================
// C-Spot Academy — Admin Session Logout API
// Endpoint: POST /api/admin/logout
// File: src/app/api/admin/logout/route.ts
// ============================================================================

import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
