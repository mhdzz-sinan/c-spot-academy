// ============================================================================
// C-Spot Academy — Secure Registration Lookup: Request 6-Digit OTP
// Endpoint: POST /api/lookup/request-otp
// File: src/app/api/lookup/request-otp/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { lookupRequestOtpSchema } from '@/lib/validations';
import { db } from '@/lib/db';
import { sha256Hex } from '@/lib/tokens';
import { maskEmail } from '@/lib/utils';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = lookupRequestOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const registrations = await db.getRegistrationsByEmail(email);

    if (registrations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No workshop registrations found for this email address.',
        },
        { status: 404 }
      );
    }

    const rawOtp = String(crypto.randomInt(100000, 999999));
    await db.createLookupOtp(email, sha256Hex(rawOtp));

    const isProduction = process.env.NODE_ENV === 'production';

    return NextResponse.json({
      success: true,
      data: {
        maskedEmail: maskEmail(email),
        expiresInMinutes: 10,
        ...(isProduction ? {} : { sandboxOtp: rawOtp }),
      },
    });
  } catch (error) {
    console.error('[POST /api/lookup/request-otp] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to send verification code.' },
      { status: 500 }
    );
  }
}
