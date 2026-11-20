// ============================================================================
// C-Spot Academy — Secure Registration Lookup: Verify OTP & Issue Access Tokens
// Endpoint: POST /api/lookup/verify-otp
// File: src/app/api/lookup/verify-otp/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { lookupVerifyOtpSchema } from '@/lib/validations';
import { db } from '@/lib/db';
import { sha256Hex, signWorkshopAccessToken } from '@/lib/tokens';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = lookupVerifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email and 6-digit OTP.' },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;
    const isValid = await db.verifyLookupOtp(email, sha256Hex(otp));

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired verification code. Please request a new OTP.',
        },
        { status: 401 }
      );
    }

    const registrations = await db.getRegistrationsByEmail(email);
    const enriched = await Promise.all(
      registrations.map(async (reg) => {
        const workshop = await db.getWorkshopById(reg.workshop_id);
        let accessToken: string | undefined;

        if (reg.status === 'PAID') {
          const access = await db.getWorkshopAccessByRegistrationId(reg.id);
          if (access && access.is_granted) {
            accessToken = await signWorkshopAccessToken({
              registrationId: reg.id,
              workshopId: reg.workshop_id,
              registrationCode: reg.registration_code,
              nonce: access.access_token_hash,
            });
          }
        }

        return {
          id: reg.id,
          registrationCode: reg.registration_code,
          workshopTitle: workshop?.title || 'C-Spot Academy Workshop',
          workshopSlug: workshop?.slug || '',
          scheduleSummary: workshop?.schedule_summary || '',
          studentName: reg.full_name,
          status: reg.status,
          amountPaidInr: reg.amount_paid_inr,
          paidAt: reg.paid_at,
          accessToken,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        registrations: enriched,
      },
    });
  } catch (error) {
    console.error('[POST /api/lookup/verify-otp] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
