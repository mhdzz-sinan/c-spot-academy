// ============================================================================
// C-Spot Academy — Admin Overview Metrics, Roster, Workshops & Settings API
// Endpoint: GET /api/admin/stats
// File: src/app/api/admin/stats/route.ts
// ============================================================================

import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(): Promise<NextResponse> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const [dashboard, workshops, telegramUrl, telegramEnabled] =
      await Promise.all([
        db.getAdminDashboardData(),
        db.listAllWorkshopsAdmin(),
        db.getSystemSetting('telegram_group_invite_url'),
        db.getSystemSetting('telegram_access_enabled'),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        admin,
        stats: dashboard.stats,
        registrations: dashboard.registrations,
        transactions: dashboard.transactions,
        auditLogs: dashboard.auditLogs,
        workshops,
        telegramSettings: {
          inviteUrl: telegramUrl || '',
          accessEnabled: telegramEnabled !== 'false',
        },
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/stats] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load admin telemetry.' },
      { status: 500 }
    );
  }
}
