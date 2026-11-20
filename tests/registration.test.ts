// ============================================================================
// C-Spot Academy — Registration Validation & Duplicate Prevention Tests
// File: tests/registration.test.ts
// ============================================================================

import { describe, it, expect } from 'vitest';
import { createRegistrationSchema } from '../src/lib/validations';
import { normalizeIndianPhone } from '../src/lib/utils';
import { db } from '../src/lib/db';

describe('Registration Validation & Persistence', () => {
  it('normalizes +91 and leading-zero Indian phone numbers cleanly', () => {
    expect(normalizeIndianPhone('+91 98765-43210')).toBe('9876543210');
    expect(normalizeIndianPhone('09876543210')).toBe('9876543210');
    expect(normalizeIndianPhone('9876543210')).toBe('9876543210');
  });

  it('accepts valid student registration payloads', () => {
    const result = createRegistrationSchema.safeParse({
      workshopSlug: 'solidworks-cad-bootcamp',
      fullName: 'Aarav Kulkarni',
      email: 'AARAV.KULKARNI@Example.com',
      phone: '+91 9876543210',
      collegeOrCompany: 'COEP Technological University',
      departmentOrRole: 'Mechanical Engineering',
      experienceLevel: 'STUDENT_3_4_YEAR',
      city: 'Pune',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('aarav.kulkarni@example.com');
      expect(result.data.phone).toBe('9876543210');
    }
  });

  it('rejects invalid phone numbers and malformed emails', () => {
    const badPhone = createRegistrationSchema.safeParse({
      workshopSlug: 'solidworks-cad-bootcamp',
      fullName: 'Rohan Das',
      email: 'rohan@example.com',
      phone: '12345',
      collegeOrCompany: 'NIT Trichy',
      experienceLevel: 'STUDENT_1_2_YEAR',
    });
    expect(badPhone.success).toBe(false);
  });

  it('upserts pending registrations for the same email & workshop', async () => {
    const workshop = await db.getWorkshopBySlug('solidworks-cad-bootcamp');
    expect(workshop).not.toBeNull();

    const first = await db.upsertPendingRegistration({
      workshopId: workshop!.id,
      fullName: 'Meera Nair',
      email: 'meera.test@cspotacademy.in',
      phone: '9876500001',
      collegeOrCompany: 'IIT Madras',
      experienceLevel: 'STUDENT_3_4_YEAR',
      amountDueInr: workshop!.price_inr,
    });

    const second = await db.upsertPendingRegistration({
      workshopId: workshop!.id,
      fullName: 'Meera Nair Updated',
      email: 'meera.test@cspotacademy.in',
      phone: '9876500002',
      collegeOrCompany: 'IIT Madras',
      experienceLevel: 'RECENT_GRADUATE',
      amountDueInr: workshop!.price_inr,
    });

    expect(second.id).toBe(first.id);
    expect(second.full_name).toBe('Meera Nair Updated');
  });
});
