// ============================================================================
// C-Spot Academy — Cashfree Payment Webhook Handler
// Endpoint: POST /api/webhooks/cashfree
// Security: Verifies HMAC-SHA256 signature & enforces idempotency
// File: src/app/api/webhooks/cashfree/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyCashfreeWebhookSignature } from '@/lib/cashfree';
import { db } from '@/lib/db';
import type { CashfreeWebhookPayload } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.text();
    const timestamp = request.headers.get('x-webhook-timestamp');
    const signature = request.headers.get('x-webhook-signature');

    const isValidSignature = verifyCashfreeWebhookSignature({
      rawBody,
      timestamp,
      signature,
    });

    if (!isValidSignature) {
      console.warn('[Cashfree Webhook] Rejected invalid webhook signature.');
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody) as CashfreeWebhookPayload;
    const eventType = payload.type;
    const orderData = payload.data?.order;
    const paymentData = payload.data?.payment;

    if (!orderData?.order_id || !paymentData?.cf_payment_id) {
      return NextResponse.json(
        { success: false, error: 'Malformed webhook payload' },
        { status: 400 }
      );
    }

    if (
      eventType === 'PAYMENT_SUCCESS_WEBHOOK' &&
      paymentData.payment_status === 'SUCCESS'
    ) {
      const result = await db.recordVerifiedPaymentAndGrantAccess({
        orderId: orderData.order_id,
        cfPaymentId: String(paymentData.cf_payment_id),
        webhookEventId: `${eventType}_${paymentData.cf_payment_id}`,
        amount: Number(paymentData.payment_amount || orderData.order_amount),
        currency: paymentData.payment_currency || orderData.order_currency || 'INR',
        paymentMethod: paymentData.payment_group || 'ONLINE',
        bankReference: paymentData.bank_reference || null,
        paymentTime: paymentData.payment_time || payload.event_time || null,
        verificationSource: 'WEBHOOK',
        rawPayload: payload as unknown as Record<string, unknown>,
      });

      return NextResponse.json({
        success: true,
        status: 'PROCESSED',
        alreadyProcessed: result.alreadyProcessed,
        registrationCode: result.registration.registration_code,
      });
    }

    if (
      eventType === 'PAYMENT_FAILED_WEBHOOK' ||
      paymentData.payment_status === 'FAILED'
    ) {
      await db.markPaymentFailed(
        orderData.order_id,
        paymentData.payment_message || 'Payment failed'
      );
      return NextResponse.json({ success: true, status: 'FAILED_RECORDED' });
    }

    return NextResponse.json({ success: true, status: 'IGNORED', eventType });
  } catch (error) {
    console.error('[POST /api/webhooks/cashfree] Processing Error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failure' },
      { status: 500 }
    );
  }
}
