// ============================================================================
// C-Spot Academy — Cashfree Payment Order Creation API
// Endpoint: POST /api/payments/create-order
// File: src/app/api/payments/create-order/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentOrderSchema } from '@/lib/validations';
import { db } from '@/lib/db';
import { createCashfreeOrder, getCashfreeConfig } from '@/lib/cashfree';
import { generateMerchantOrderId } from '@/lib/utils';
import type { ApiResponse, CreatePaymentOrderResponse } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CreatePaymentOrderResponse>>> {
  try {
    const body = await request.json();
    const parsed = createPaymentOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Valid registrationId is required.', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { registrationId } = parsed.data;

    const registration = await db.getRegistrationById(registrationId);
    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration record not found.', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (registration.status === 'PAID') {
      return NextResponse.json(
        {
          success: false,
          error: 'This registration has already been paid.',
          code: 'ALREADY_PAID',
        },
        { status: 409 }
      );
    }

    const workshop = await db.getWorkshopById(registration.workshop_id);
    if (!workshop || !workshop.registration_open) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workshop is no longer accepting payments.',
          code: 'WORKSHOP_CLOSED',
        },
        { status: 403 }
      );
    }

    const authoritativeAmount = workshop.price_inr;
    const orderId = generateMerchantOrderId();

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      request.nextUrl.origin;

    const returnUrl = `${appUrl}/payment/callback?order_id={order_id}`;
    const notifyUrl = `${appUrl}/api/webhooks/cashfree`;

    const cfOrder = await createCashfreeOrder({
      orderId,
      orderAmount: authoritativeAmount,
      orderCurrency: workshop.currency || 'INR',
      customerId: registration.id,
      customerName: registration.full_name,
      customerEmail: registration.email,
      customerPhone: registration.phone,
      returnUrl,
      notifyUrl,
      orderNote: `${workshop.slug} | ${registration.registration_code}`,
    });

    await db.createPaymentOrder({
      orderId: cfOrder.order_id,
      cfOrderId: cfOrder.cf_order_id,
      registrationId: registration.id,
      workshopId: workshop.id,
      amount: authoritativeAmount,
      currency: workshop.currency || 'INR',
      status: 'ACTIVE',
      paymentSessionId: cfOrder.payment_session_id,
      cfOrderExpiry: cfOrder.order_expiry_time || null,
      gatewayResponse: cfOrder as unknown as Record<string, unknown>,
    });

    const { env } = getCashfreeConfig();

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: cfOrder.order_id,
          cfOrderId: cfOrder.cf_order_id,
          paymentSessionId: cfOrder.payment_session_id,
          amount: authoritativeAmount,
          currency: workshop.currency || 'INR',
          environment: env,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/payments/create-order] Error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to initiate payment session. Please try again.';
    return NextResponse.json(
      { success: false, error: message, code: 'GATEWAY_ERROR' },
      { status: 502 }
    );
  }
}
