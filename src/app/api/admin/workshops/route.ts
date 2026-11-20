// ============================================================================
// C-Spot Academy — Admin Workshop Pricing, Seats & Availability API
// Endpoint: PATCH /api/admin/workshops
// File: src/app/api/admin/workshops/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { adminUpdateWorkshopSchema } from '@/lib/validations';
import { db } from '@/lib/db';

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = adminUpdateWorkshopSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid workshop update payload.',
        },
        { status: 400 }
      );
    }

    const { workshopId, ...updates } = parsed.data;
    const updated = await db.updateWorkshop(workshopId, updates);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Workshop not found.' },
        { status: 404 }
      );
    }

    await db.logAdminAction({
      adminIdentifier: admin.email,
      action: 'UPDATE_WORKSHOP',
      targetType: 'WORKSHOP',
      targetId: workshopId,
      metadata: updates,
    });

    return NextResponse.json({
      success: true,
      data: { workshop: updated },
    });
  } catch (error) {
    console.error('[PATCH /api/admin/workshops] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update workshop.' },
      { status: 500 }
    );
  }
}
