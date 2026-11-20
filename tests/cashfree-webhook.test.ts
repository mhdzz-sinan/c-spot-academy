// ============================================================================
// C-Spot Academy — Cashfree Webhook HMAC-SHA256 & Idempotency Tests
// File: tests/cashfree-webhook.test.ts
// ============================================================================

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyCashfreeWebhookSignature } from '../src/lib/cashfree';
import { db } from '../src/lib/db';

describe('Cashfree Webhook Signature & Idempotent State Transitions', () => {
  const testSecret = 'cf_test_webhook_secret_key_2026';

  it('verifies valid Cashfree HMAC-SHA256 webhook signatures', () => {
    const timestamp = '1735689600000';
    const rawBody = JSON.stringify({
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: { order: { order_id: 'CSPOT_ORD_TEST_1' } },
    });

    const signature = crypto
      .createHmac('sha256', testSecret)
      .update(`${timestamp}${rawBody}`)
      .digest('base64');

    expect(
      verifyCashfreeWebhookSignature({
        rawBody,
        timestamp,
        signature,
        secretOverride: testSecret,
      })
    ).toBe(true);
  });

  it('rejects tampered payloads or invalid signatures', () => {
    const timestamp = '1735689600000';
    const rawBody = JSON.stringify({
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: { order: { order_id: 'CSPOT_ORD_TEST_1', order_amount: 499 } },
    });

    const signature = crypto
      .createHmac('sha256', testSecret)
      .update(`${timestamp}${rawBody}`)
      .digest('base64');

    const tamperedBody = rawBody.replace('499', '1');

    expect(
      verifyCashfreeWebhookSignature({
        rawBody: tamperedBody,
        timestamp,
        signature,
        secretOverride: testSecret,
      })
    ).toBe(false);
  });

  it('processes payment verification idempotently without double-counting seats', async () => {
    const workshop = await db.getWorkshopBySlug('solidworks-cad-bootcamp');
    expect(workshop).not.toBeNull();
    const initialSeats = workshop!.seats_filled;

    const reg = await db.upsertPendingRegistration({
      workshopId: workshop!.id,
      fullName: 'Vikram Menon',
      email: 'vikram.webhook@cspotacademy.in',
      phone: '9876511111',
      collegeOrCompany: 'RVCE Bengaluru',
      experienceLevel: 'STUDENT_3_4_YEAR',
      amountDueInr: workshop!.price_inr,
    });

    const orderId = `CSPOT_ORD_IDEMP_${Date.now()}`;
    await db.createPaymentOrder({
      orderId,
      cfOrderId: `cf_${orderId}`,
      registrationId: reg.id,
      workshopId: workshop!.id,
      amount: workshop!.price_inr,
      currency: 'INR',
      status: 'ACTIVE',
      paymentSessionId: 'sess_test',
    });

    const firstPass = await db.recordVerifiedPaymentAndGrantAccess({
      orderId,
      cfPaymentId: `pay_unique_${orderId}`,
      amount: workshop!.price_inr,
      currency: 'INR',
      verificationSource: 'WEBHOOK',
      rawPayload: {},
    });

    expect(firstPass.alreadyProcessed).toBe(false);
    expect(firstPass.registration.status).toBe('PAID');
    expect(firstPass.access.is_granted).toBe(true);

    const replayPass = await db.recordVerifiedPaymentAndGrantAccess({
      orderId,
      cfPaymentId: `pay_unique_${orderId}`,
      amount: workshop!.price_inr,
      currency: 'INR',
      verificationSource: 'WEBHOOK',
      rawPayload: {},
    });

    expect(replayPass.alreadyProcessed).toBe(true);

    const updatedWorkshop = await db.getWorkshopBySlug('solidworks-cad-bootcamp');
    expect(updatedWorkshop!.seats_filled).toBe(initialSeats + 1);
  });
});
