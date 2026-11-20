// ============================================================================
// C-Spot Academy — Cryptographic Telegram Access & Revocation Tests
// File: tests/telegram-access.test.ts
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  generateAccessNonce,
  signWorkshopAccessToken,
  verifyWorkshopAccessToken,
} from '../src/lib/tokens';
import { db } from '../src/lib/db';

describe('Token-Gated Telegram Cohort Access Security', () => {
  it('signs and verifies valid Workshop Access JWTs', async () => {
    const nonce = generateAccessNonce();
    const token = await signWorkshopAccessToken({
      registrationId: 'reg-123',
      workshopId: 'ws-123',
      registrationCode: 'CSA-2026-ABCDEF',
      nonce,
    });

    const verified = await verifyWorkshopAccessToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe('reg-123');
    expect(verified?.nonce).toBe(nonce);
  });

  it('rejects tampered JWT payloads', async () => {
    const nonce = generateAccessNonce();
    const token = await signWorkshopAccessToken({
      registrationId: 'reg-123',
      workshopId: 'ws-123',
      registrationCode: 'CSA-2026-ABCDEF',
      nonce,
    });

    const parts = token.split('.');
    const tampered = `${parts[0]}.${parts[1]}tampered.${parts[2]}`;
    const verified = await verifyWorkshopAccessToken(tampered);
    expect(verified).toBeNull();
  });

  it('invalidates existing tokens immediately when admin rotates nonce or revokes access', async () => {
    const workshop = await db.getWorkshopBySlug('solidworks-cad-bootcamp');
    const reg = await db.upsertPendingRegistration({
      workshopId: workshop!.id,
      fullName: 'Sneha Reddy',
      email: 'sneha.tg@cspotacademy.in',
      phone: '9876522222',
      collegeOrCompany: 'BITS Pilani',
      experienceLevel: 'WORKING_PROFESSIONAL',
      amountDueInr: workshop!.price_inr,
    });

    const orderId = `CSPOT_ORD_TG_${Date.now()}`;
    await db.createPaymentOrder({
      orderId,
      cfOrderId: `cf_${orderId}`,
      registrationId: reg.id,
      workshopId: workshop!.id,
      amount: workshop!.price_inr,
      currency: 'INR',
      status: 'ACTIVE',
      paymentSessionId: 'sess_tg',
    });

    const { access } = await db.recordVerifiedPaymentAndGrantAccess({
      orderId,
      cfPaymentId: `pay_${orderId}`,
      amount: workshop!.price_inr,
      currency: 'INR',
      verificationSource: 'SERVER_VERIFY',
      rawPayload: {},
    });

    const originalJwt = await signWorkshopAccessToken({
      registrationId: reg.id,
      workshopId: workshop!.id,
      registrationCode: reg.registration_code,
      nonce: access.access_token_hash,
    });

    const claims = await verifyWorkshopAccessToken(originalJwt);
    expect(claims?.nonce).toBe(access.access_token_hash);

    const rotated = await db.updateWorkshopAccessControl({
      registrationId: reg.id,
      action: 'ROTATE_TOKEN',
    });

    expect(rotated?.access_token_hash).not.toBe(claims?.nonce);
  });
});
