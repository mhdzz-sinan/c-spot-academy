// ============================================================================
// C-Spot Academy — Self-Service Lookup & Payment Verification Tests
// File: tests/lookup-and-status.test.ts
// ============================================================================

import { describe, it, expect } from 'vitest';
import { db } from '../src/lib/db';
import { sha256Hex, signWorkshopAccessToken } from '../src/lib/tokens';

describe('Registration Lookup & Payment Status Verification', () => {
  it('creates and verifies 6-digit OTP hashes for student lookup', async () => {
    const testEmail = 'student.lookup@example.com';
    const otp = '849201';
    const hash = sha256Hex(otp);

    await db.createLookupOtp(testEmail, hash);

    // Wrong OTP must fail
    const wrongAttempt = await db.verifyLookupOtp(testEmail, sha256Hex('111111'));
    expect(wrongAttempt).toBe(false);

    // Correct OTP must succeed
    const correctAttempt = await db.verifyLookupOtp(testEmail, hash);
    expect(correctAttempt).toBe(true);

    // Replay of verified OTP must fail
    const replayAttempt = await db.verifyLookupOtp(testEmail, hash);
    expect(replayAttempt).toBe(false);
  });

  it('retrieves all registrations associated with a verified email', async () => {
    const email = 'multienroll.test@cspotacademy.in';
    const workshop = await db.getWorkshopBySlug('solidworks-cad-bootcamp');
    expect(workshop).not.toBeNull();

    await db.upsertPendingRegistration({
      workshopId: workshop!.id,
      fullName: 'Ananya Deshmukh',
      email,
      phone: '9876599999',
      collegeOrCompany: 'Pune Institute of Computer Technology',
      experienceLevel: 'STUDENT_3_4_YEAR',
      amountDueInr: workshop!.price_inr,
    });

    const results = await db.getRegistrationsByEmail(email);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].email).toBe(email);
    expect(results[0].full_name).toBe('Ananya Deshmukh');
  });
});
