// ============================================================================
// C-Spot Academy — Independent Server-to-Server Payment Status Verifier
// Endpoint: POST /api/payments/verify
// File: src/app/api/payments/verify/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSchema } from '@/lib/validations';
import { db } from '@/lib/db';
import { fetchCashfreeOrderStatus } from '@/lib/cashfree';
import { signWorkshopAccessToken } from '@/lib/tokens';
import type { ApiResponse, VerifyPaymentResponse } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<VerifyPaymentResponse>>> {
  try {
    const body = await request.json();
    const parsed = verifyPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required.', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;

    const order = await db.getPaymentOrderByOrderId(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Payment order not found.', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    let registration = await db.getRegistrationById(order.registration_id);
    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found.', code: 'REG_NOT_FOUND' },
        { status: 404 }
      );
    }

    const workshop = await db.getWorkshopById(order.workshop_id);
    const workshopTitle = workshop?.title || 'C-Spot Academy Workshop';

    if (registration.status === 'PAID') {
      const access = await db.getWorkshopAccessByRegistrationId(registration.id);
      let accessToken: string | undefined;

      if (access && access.is_granted) {
        accessToken = await signWorkshopAccessToken({
          registrationId: registration.id,
          workshopId: registration.workshop_id,
          registrationCode: registration.registration_code,
          nonce: access.access_token_hash,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          status: 'PAID',
          orderStatus: 'PAID',
          registrationCode: registration.registration_code,
          workshopTitle,
          studentName: registration.full_name,
          studentEmail: registration.email,
          accessToken,
        },
      });
    }

    const cfStatus = await fetchCashfreeOrderStatus(order.order_id);

    if (cfStatus.order_status === 'PAID') {
      const verifiedAmount =
        cfStatus.order_amount > 0 ? cfStatus.order_amount : order.amount;

      const reconciled = await db.recordVerifiedPaymentAndGrantAccess({
        orderId: order.order_id,
        cfPaymentId: cfStatus.cf_payment_id || `cf_srv_${order.order_id}`,
        amount: verifiedAmount,
        currency: cfStatus.order_currency || order.currency,
        paymentMethod: cfStatus.payment_method || 'ONLINE',
        bankReference: cfStatus.bank_reference || null,
        paymentTime: cfStatus.payment_time || new Date().toISOString(),
        verificationSource: 'SERVER_VERIFY',
        rawPayload: cfStatus.raw,
      });

      registration = reconciled.registration;

      let accessToken: string | undefined;
      if (reconciled.access.is_granted) {
        accessToken = await signWorkshopAccessToken({
          registrationId: registration.id,
          workshopId: registration.workshop_id,
          registrationCode: registration.registration_code,
          nonce: reconciled.access.access_token_hash,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          status: 'PAID',
          orderStatus: 'PAID',
          registrationCode: registration.registration_code,
          workshopTitle,
          studentName: registration.full_name,
          studentEmail: registration.email,
          accessToken,
        },
      });
    }

    if (
      cfStatus.order_status === 'EXPIRED' ||
      cfStatus.order_status === 'TERMINATED'
    ) {
      await db.markPaymentFailed(
        order.order_id,
        `Order ${cfStatus.order_status.toLowerCase()} at payment gateway`
      );
      return NextResponse.json({
        success: true,
        data: {
          status: 'FAILED',
          orderStatus: 'EXPIRED',
          registrationCode: registration.registration_code,
          workshopTitle,
          studentName: registration.full_name,
          studentEmail: registration.email,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: registration.status,
        orderStatus: 'ACTIVE',
        registrationCode: registration.registration_code,
        workshopTitle,
        studentName: registration.full_name,
        studentEmail: registration.email,
      },
    });
  } catch (error) {
    console.error('[POST /api/payments/verify] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to verify payment status right now. Please retry shortly.',
        code: 'VERIFY_ERROR',
      },
      { status: 500 }
    );
  }
}
