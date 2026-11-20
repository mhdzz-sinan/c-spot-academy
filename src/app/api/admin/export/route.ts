// ============================================================================
// C-Spot Academy — Admin Student Registrations CSV Export API
// Endpoint: GET /api/admin/export?status=PAID
// File: src/app/api/admin/export/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const statusFilter = request.nextUrl.searchParams.get('status');
    const dashboard = await db.getAdminDashboardData();

    let rows = dashboard.registrations;
    if (statusFilter && statusFilter !== 'ALL') {
      rows = rows.filter((r) => r.status === statusFilter);
    }

    const headers = [
      'Registration Code',
      'Workshop',
      'Full Name',
      'Email',
      'Phone',
      'College / Company',
      'Department / Role',
      'Experience Level',
      'City',
      'Status',
      'Amount Paid (INR)',
      'Telegram Access',
      'Paid At',
      'Registered At',
    ];

    const csvLines = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.registration_code,
          r.workshop_title,
          r.full_name,
          r.email,
          r.phone,
          r.college_or_company,
          r.department_or_role || '',
          r.experience_level,
          r.city || '',
          r.status,
          r.amount_paid_inr,
          r.has_telegram_access ? 'GRANTED' : 'LOCKED',
          r.paid_at || '',
          r.created_at,
        ]
          .map(escapeCsvCell)
          .join(',')
      ),
    ];

    await db.logAdminAction({
      adminIdentifier: admin.email,
      action: 'EXPORT_REGISTRATIONS_CSV',
      targetType: 'REGISTRATIONS',
      targetId: statusFilter || 'ALL',
      metadata: { rowCount: rows.length },
    });

    const csvContent = csvLines.join('\n');
    const filename = `cspot-academy-registrations-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/export] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export CSV.' },
      { status: 500 }
    );
  }
}
