// ============================================================================
// C-Spot Academy — Admin Student Access Control & Manual Reconciliation API
// Endpoint: POST /api/admin/registrations
// File: src/app/api/admin/registrations/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { adminAccessControlSchema } from '@/lib/validations';
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
    const parsed = adminAccessControlSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid action payload.',
        },
        { status: 400 }
      );
    }

    const { registrationId, action, reason } = parsed.data;

    if (action === 'MARK_PAID_MANUAL') {
      const result = await db.manuallyMarkRegistrationPaid({
        registrationId,
        adminIdentifier: admin.email,
        reason,
      });

      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Registration not found.' },
          { status: 404 }
        );
      }

      await db.logAdminAction({
        adminIdentifier: admin.email,
        action: 'MARK_PAID_MANUAL',
        targetType: 'REGISTRATION',
        targetId: registrationId,
        metadata: { reason: reason || 'Manual admin reconciliation' },
      });

      return NextResponse.json({ success: true, data: result });
    }

    const updatedAccess = await db.updateWorkshopAccessControl({
      registrationId,
      action,
      reason,
    });

    if (!updatedAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workshop access record not found for this registration.',
        },
        { status: 404 }
      );
    }

    await db.logAdminAction({
      adminIdentifier: admin.email,
      action,
      targetType: 'WORKSHOP_ACCESS',
      targetId: registrationId,
      metadata: { reason: reason || null },
    });

    return NextResponse.json({
      success: true,
      data: { access: updatedAccess },
    });
  } catch (error) {
    console.error('[POST /api/admin/registrations] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute admin registration action.' },
      { status: 500 }
    );
  }
}
