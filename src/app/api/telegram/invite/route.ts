// ============================================================================
// C-Spot Academy — Token-Gated Telegram Invite Link Dispenser
// Endpoint: POST /api/telegram/invite
// File: src/app/api/telegram/invite/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { telegramInviteRequestSchema } from '@/lib/validations';
import { verifyWorkshopAccessToken } from '@/lib/tokens';
import { db } from '@/lib/db';
import type { ApiResponse, TelegramInviteResponse } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TelegramInviteResponse>>> {
  try {
    const body = await request.json();
    const parsed = telegramInviteRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid access token is required to unlock Telegram access.',
          code: 'MISSING_TOKEN',
        },
        { status: 400 }
      );
    }

    const claims = await verifyWorkshopAccessToken(parsed.data.accessToken);
    if (!claims) {
      return NextResponse.json(
        {
          success: false,
          error: 'Your access token is invalid or has expired. Please use Registration Lookup to retrieve a fresh link.',
          code: 'INVALID_TOKEN',
        },
        { status: 401 }
      );
    }

    const accessEnabled = await db.getSystemSetting('telegram_access_enabled');
    if (accessEnabled === 'false') {
      return NextResponse.json(
        {
          success: false,
          error: 'Telegram invite link distribution is temporarily paused by C-Spot Academy administrators.',
          code: 'TELEGRAM_PAUSED',
        },
        { status: 503 }
      );
    }

    const registration = await db.getRegistrationById(claims.sub);
    if (!registration || registration.status !== 'PAID') {
      return NextResponse.json(
        {
          success: false,
          error: 'Confirmed payment is required before accessing the cohort Telegram group.',
          code: 'PAYMENT_REQUIRED',
        },
        { status: 403 }
      );
    }

    const access = await db.getWorkshopAccessByRegistrationId(registration.id);
    if (!access || !access.is_granted || access.access_token_hash !== claims.nonce) {
      return NextResponse.json(
        {
          success: false,
          error: 'Telegram access for this registration has been revoked or rotated.',
          code: 'ACCESS_REVOKED',
        },
        { status: 403 }
      );
    }

    const inviteUrl =
      (await db.getSystemSetting('telegram_group_invite_url')) ||
      process.env.TELEGRAM_GROUP_INVITE_URL;

    if (!inviteUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Telegram group invite link is not yet configured. Please contact support.',
          code: 'INVITE_NOT_CONFIGURED',
        },
        { status: 500 }
      );
    }

    await db.recordTelegramLinkReveal(access.id);

    const workshop = await db.getWorkshopById(registration.workshop_id);

    return NextResponse.json({
      success: true,
      data: {
        inviteUrl,
        workshopTitle: workshop?.title || 'C-Spot Academy Workshop',
        registrationCode: registration.registration_code,
        studentName: registration.full_name,
      },
    });
  } catch (error) {
    console.error('[POST /api/telegram/invite] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to retrieve Telegram invite link. Please try again.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
