// ============================================================================
// C-Spot Academy — Admin Payment Transactions & Gateway Audit API
// Endpoint: GET /api/admin/payments, POST /api/admin/payments/refresh
// File: src/app/api/admin/payments/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { fetchCashfreeOrderStatus } from '@/lib/cashfree';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dashboard = await db.getAdminDashboardData();
    const status = request.nextUrl.searchParams.get('status');

    let txns = dashboard.transactions;
    if (status && status !== 'ALL') {
      txns = txns.filter((t) => t.status === status);
    }

    return NextResponse.json({
      success: true,
      data: {
        transactions: txns,
        totalRevenueInr: dashboard.stats.totalRevenueInr,
        paidCount: dashboard.stats.paidRegistrations,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/payments] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments ledger.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const orderId = body.orderId;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid orderId is required.' },
        { status: 400 }
      );
    }

    const cfStatus = await fetchCashfreeOrderStatus(orderId);

    if (cfStatus.order_status === 'PAID') {
      const order = await db.getPaymentOrderByOrderId(orderId);
      if (order) {
        await db.recordVerifiedPaymentAndGrantAccess({
          orderId,
          cfPaymentId: cfStatus.cf_payment_id || `cf_adm_reconcile_${orderId}`,
          amount: cfStatus.order_amount > 0 ? cfStatus.order_amount : order.amount,
          currency: cfStatus.order_currency || order.currency,
          paymentMethod: cfStatus.payment_method || 'ONLINE',
          bankReference: cfStatus.bank_reference || null,
          paymentTime: cfStatus.payment_time || new Date().toISOString(),
          verificationSource: 'ADMIN_MANUAL',
          rawPayload: cfStatus.raw,
        });

        await db.logAdminAction({
          adminIdentifier: admin.email,
          action: 'PAYMENT_GATEWAY_RECONCILE',
          targetType: 'PAYMENT_ORDER',
          targetId: orderId,
          metadata: { status: 'PAID', amount: cfStatus.order_amount },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { gatewayStatus: cfStatus },
    });
  } catch (error) {
    console.error('[POST /api/admin/payments] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reconcile payment with gateway.' },
      { status: 500 }
    );
  }
}
