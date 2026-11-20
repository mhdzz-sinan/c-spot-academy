// ============================================================================
// C-Spot Academy — Admin Authentication Login API
// Endpoint: POST /api/admin/login
// File: src/app/api/admin/login/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { adminLoginSchema } from '@/lib/validations';
import { ADMIN_COOKIE_NAME, verifyAdminCredentials } from '@/lib/auth';
import { signAdminSessionToken } from '@/lib/tokens';
import { db } from '@/lib/db';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Valid admin email and password are required.' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const isAuthenticated = verifyAdminCredentials(email, password);

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Invalid administrator credentials.' },
        { status: 401 }
      );
    }

    const sessionToken = await signAdminSessionToken(email, 'SUPER_ADMIN');

    try {
      await db.logAdminAction({
        adminIdentifier: email,
        action: 'ADMIN_LOGIN',
        targetType: 'ADMIN_SESSION',
        targetId: email,
      });
    } catch (auditErr) {
      console.warn('[POST /api/admin/login] Failed to log admin audit record:', auditErr);
    }

    const response = NextResponse.json({
      success: true,
      data: { email, role: 'SUPER_ADMIN' },
    });

    const isHttps =
      request.nextUrl.protocol === 'https:' ||
      request.headers.get('x-forwarded-proto') === 'https';

    response.cookies.set(ADMIN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error('[POST /api/admin/login] Authentication error details:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to authenticate administrator.' },
      { status: 500 }
    );
  }
}
