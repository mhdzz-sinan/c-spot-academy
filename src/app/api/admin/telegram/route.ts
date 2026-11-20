// ============================================================================
// C-Spot Academy — Admin Telegram Invite Link Rotation & Access Toggle API
// Endpoint: POST /api/admin/telegram
// File: src/app/api/admin/telegram/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { adminUpdateTelegramSchema } from '@/lib/validations';
import { db } from '@/lib/db';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = adminUpdateTelegramSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid Telegram configuration.',
        },
        { status: 400 }
      );
    }

    const { inviteUrl, accessEnabled } = parsed.data;

    await Promise.all([
      db.setSystemSetting('telegram_group_invite_url', inviteUrl, admin.email),
      db.setSystemSetting(
        'telegram_access_enabled',
        accessEnabled ? 'true' : 'false',
        admin.email
      ),
    ]);

    await db.logAdminAction({
      adminIdentifier: admin.email,
      action: 'UPDATE_TELEGRAM_SETTINGS',
      targetType: 'SYSTEM_SETTINGS',
      targetId: 'telegram_group_invite_url',
      metadata: {
        accessEnabled,
        inviteUrlRotated: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { inviteUrl, accessEnabled },
    });
  } catch (error) {
    console.error('[POST /api/admin/telegram] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update Telegram configuration.' },
      { status: 500 }
    );
  }
}
