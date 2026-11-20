// ============================================================================
// C-Spot Academy — Core Domain Models, Database Entities & API DTOs
// File: src/types/index.ts
// ============================================================================

export type WorkshopType = 'LIVE_WORKSHOP' | 'ADVANCED_COURSE';

export type RegistrationStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentOrderStatus =
  | 'CREATED'
  | 'ACTIVE'
  | 'PAID'
  | 'EXPIRED'
  | 'FAILED'
  | 'CANCELLED';

export type PaymentTxnStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'PENDING'
  | 'USER_DROPPED'
  | 'FLAGGED'
  | 'VOID';

export type VerificationSource = 'WEBHOOK' | 'SERVER_VERIFY' | 'ADMIN_MANUAL';

export type ExperienceLevel =
  | 'STUDENT_1_2_YEAR'
  | 'STUDENT_3_4_YEAR'
  | 'RECENT_GRADUATE'
  | 'WORKING_PROFESSIONAL'
  | 'BEGINNER';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';

export interface Workshop {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  type: WorkshopType;
  description: string;
  highlights: string[];
  prerequisites: string[];
  deliverables: string[];
  price_inr: number;
  original_price_inr: number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  schedule_summary: string;
  mode: string;
  max_seats: number;
  seats_filled: number;
  is_active: boolean;
  is_featured: boolean;
  registration_open: boolean;
  instructor_name: string;
  instructor_bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkshopDay {
  id: string;
  workshop_id: string;
  day_number: number;
  title: string;
  summary: string;
  session_date: string | null;
  duration_minutes: number;
  topics: string[];
  hands_on_project: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkshopWithCurriculum extends Workshop {
  days: WorkshopDay[];
}

export interface Registration {
  id: string;
  registration_code: string;
  workshop_id: string;
  full_name: string;
  email: string;
  phone: string;
  college_or_company: string;
  department_or_role: string | null;
  experience_level: ExperienceLevel | string;
  city: string | null;
  referral_source: string | null;
  status: RegistrationStatus;
  amount_due_inr: number;
  amount_paid_inr: number;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentOrder {
  id: string;
  order_id: string;
  cf_order_id: string | null;
  registration_id: string;
  workshop_id: string;
  amount: number;
  currency: string;
  status: PaymentOrderStatus;
  payment_session_id: string | null;
  cf_order_expiry: string | null;
  gateway_response: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  payment_order_id: string;
  registration_id: string;
  cf_payment_id: string;
  webhook_event_id: string | null;
  amount: number;
  currency: string;
  status: PaymentTxnStatus;
  payment_method: string | null;
  bank_reference: string | null;
  payment_time: string | null;
  verification_source: VerificationSource;
  raw_payload: Record<string, unknown>;
  created_at: string;
}

export interface WorkshopAccess {
  id: string;
  registration_id: string;
  workshop_id: string;
  access_token_hash: string;
  is_granted: boolean;
  revoked_at: string | null;
  revoked_reason: string | null;
  telegram_link_revealed_count: number;
  last_accessed_at: string | null;
  granted_at: string;
  updated_at: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string | null;
  is_secret: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_identifier: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface LookupOtp {
  id: string;
  email: string;
  otp_hash: string;
  attempts: number;
  expires_at: string;
  verified_at: string | null;
  created_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface CreateRegistrationInput {
  workshopSlug: string;
  fullName: string;
  email: string;
  phone: string;
  collegeOrCompany: string;
  departmentOrRole?: string;
  experienceLevel: ExperienceLevel | string;
  city?: string;
  referralSource?: string;
}

export interface CreateRegistrationResponse {
  registration: Registration;
  workshop: Pick<Workshop, 'id' | 'slug' | 'title' | 'price_inr' | 'currency'>;
}

export interface CreatePaymentOrderResponse {
  orderId: string;
  cfOrderId: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
  environment: 'sandbox' | 'production';
}

export interface VerifyPaymentResponse {
  status: RegistrationStatus;
  orderStatus: PaymentOrderStatus;
  registrationCode: string;
  workshopTitle: string;
  studentName: string;
  studentEmail: string;
  accessToken?: string;
}

export interface TelegramInviteResponse {
  inviteUrl: string;
  workshopTitle: string;
  registrationCode: string;
  studentName: string;
}

export interface AdminDashboardStats {
  totalRegistrations: number;
  paidRegistrations: number;
  pendingRegistrations: number;
  totalRevenueInr: number;
  activeWorkshopsCount: number;
  telegramAccessGrantedCount: number;
  recentRegistrations: Array<
    Registration & {
      workshop_title?: string;
      has_telegram_access?: boolean;
    }
  >;
}

export interface CashfreeWebhookPayload {
  type: string;
  event_time: string;
  data: {
    order: {
      order_id: string;
      order_amount: number;
      order_currency: string;
      order_tags?: Record<string, string> | null;
    };
    payment: {
      cf_payment_id: number | string;
      payment_status: string;
      payment_amount: number;
      payment_currency: string;
      payment_message?: string;
      payment_time?: string;
      bank_reference?: string;
      payment_group?: string;
      payment_method?: Record<string, unknown>;
    };
    customer_details?: {
      customer_id?: string;
      customer_name?: string;
      customer_email?: string;
      customer_phone?: string;
    };
  };
}
