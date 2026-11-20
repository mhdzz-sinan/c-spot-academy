// ============================================================================
// C-Spot Academy — Request & Input Validation Schemas (Zod)
// File: src/lib/validations.ts
// ============================================================================

import { z } from 'zod';
import { normalizeIndianPhone } from './utils';

export const createRegistrationSchema = z.object({
  workshopSlug: z
    .string()
    .trim()
    .min(2, 'Workshop identifier is required')
    .max(120),
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name (at least 2 characters)')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .max(150),
  phone: z
    .string()
    .trim()
    .transform((val) => normalizeIndianPhone(val))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: 'Please enter a valid 10-digit Indian mobile number',
    }),
  collegeOrCompany: z
    .string()
    .trim()
    .min(2, 'Please enter your college, university, or company name')
    .max(150),
  departmentOrRole: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal('')),
  experienceLevel: z.enum([
    'STUDENT_1_2_YEAR',
    'STUDENT_3_4_YEAR',
    'RECENT_GRADUATE',
    'WORKING_PROFESSIONAL',
    'BEGINNER',
  ]),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  referralSource: z.string().trim().max(80).optional().or(z.literal('')),
});

export type ValidatedRegistrationInput = z.infer<typeof createRegistrationSchema>;

export const createPaymentOrderSchema = z.object({
  registrationId: z.string().uuid('Invalid registration ID format'),
});

export const verifyPaymentSchema = z.object({
  orderId: z
    .string()
    .trim()
    .min(5, 'Order ID is required')
    .max(80, 'Invalid order ID length'),
});

export const telegramInviteRequestSchema = z.object({
  accessToken: z
    .string()
    .trim()
    .min(20, 'Valid access token is required'),
});

export const lookupRequestOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email('Valid email address is required'),
});

export const lookupVerifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email('Valid email address is required'),
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Admin email is required'),
  password: z.string().min(4, 'Admin password is required'),
});

export const adminUpdateTelegramSchema = z.object({
  inviteUrl: z
    .string()
    .trim()
    .url('Please enter a valid URL')
    .refine(
      (url) => url.startsWith('https://t.me/') || url.startsWith('https://telegram.me/'),
      { message: 'Invite URL must be an official https://t.me/ link' }
    ),
  accessEnabled: z.boolean(),
});

export const adminUpdateWorkshopSchema = z.object({
  workshopId: z.string().uuid(),
  title: z.string().trim().min(3).max(200).optional(),
  subtitle: z.string().trim().min(5).max(300).optional(),
  price_inr: z.number().int().min(0).max(500000).optional(),
  original_price_inr: z.number().int().min(0).max(500000).nullable().optional(),
  schedule_summary: z.string().trim().min(3).max(200).optional(),
  max_seats: z.number().int().min(1).max(10000).optional(),
  registration_open: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const adminAccessControlSchema = z.object({
  registrationId: z.string().uuid(),
  action: z.enum(['GRANT_ACCESS', 'REVOKE_ACCESS', 'ROTATE_TOKEN', 'MARK_PAID_MANUAL']),
  reason: z.string().trim().max(300).optional(),
});
