// ============================================================================
// C-Spot Academy — Student Registration Creation API
// Endpoint: POST /api/registrations
// File: src/app/api/registrations/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRegistrationSchema } from '@/lib/validations';
import { db } from '@/lib/db';
import type { ApiResponse, CreateRegistrationResponse } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CreateRegistrationResponse>>> {
  try {
    const body = await request.json();
    const parsed = createRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || 'Invalid registration data';
      return NextResponse.json(
        { success: false, error: firstError, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const input = parsed.data;

    const workshop = await db.getWorkshopBySlug(input.workshopSlug);
    if (!workshop || !workshop.is_active) {
      return NextResponse.json(
        { success: false, error: 'Selected workshop was not found.', code: 'WORKSHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!workshop.registration_open) {
      return NextResponse.json(
        {
          success: false,
          error: 'Registrations for this cohort are currently closed.',
          code: 'REGISTRATION_CLOSED',
        },
        { status: 403 }
      );
    }

    if (workshop.seats_filled >= workshop.max_seats) {
      return NextResponse.json(
        {
          success: false,
          error: 'All seats for this workshop cohort are currently full.',
          code: 'SEATS_FULL',
        },
        { status: 409 }
      );
    }

    const existingPaid = await db.findPaidRegistrationByEmail(
      workshop.id,
      input.email
    );

    if (existingPaid) {
      return NextResponse.json(
        {
          success: false,
          error: `You are already registered and confirmed for this workshop (Registration ID: ${existingPaid.registration_code}). Use the Registration Lookup page to access your Telegram invite.`,
          code: 'ALREADY_REGISTERED',
        },
        { status: 409 }
      );
    }

    const registration = await db.upsertPendingRegistration({
      workshopId: workshop.id,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      collegeOrCompany: input.collegeOrCompany,
      departmentOrRole: input.departmentOrRole,
      experienceLevel: input.experienceLevel,
      city: input.city,
      referralSource: input.referralSource,
      amountDueInr: workshop.price_inr,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          registration,
          workshop: {
            id: workshop.id,
            slug: workshop.slug,
            title: workshop.title,
            price_inr: workshop.price_inr,
            currency: workshop.currency,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/registrations] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to process registration at this moment. Please try again.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
