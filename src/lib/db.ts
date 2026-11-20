// ============================================================================
// C-Spot Academy — Unified Dual-Mode Database Repository
// Connects to Supabase PostgreSQL when configured, with an automatic
// in-memory sandbox store pre-seeded for zero-config local execution & tests.
// File: src/lib/db.ts
// ============================================================================

import crypto from 'crypto';
import type {
  AdminAuditLog,
  AdminDashboardStats,
  LookupOtp,
  PaymentOrder,
  PaymentOrderStatus,
  PaymentTransaction,
  PaymentTxnStatus,
  Registration,
  SystemSetting,
  VerificationSource,
  Workshop,
  WorkshopAccess,
  WorkshopDay,
  WorkshopWithCurriculum,
} from '@/types';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';
import { generateRegistrationCode as createRegCode } from './utils';
import { generateAccessNonce as createNonce } from './tokens';

interface MemoryStore {
  workshops: Workshop[];
  workshopDays: WorkshopDay[];
  registrations: Registration[];
  paymentOrders: PaymentOrder[];
  paymentTransactions: PaymentTransaction[];
  workshopAccess: WorkshopAccess[];
  systemSettings: Record<string, SystemSetting>;
  auditLogs: AdminAuditLog[];
  lookupOtps: LookupOtp[];
}

function createInitialMemoryStore(): MemoryStore {
  const now = new Date().toISOString();
  const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString();

  const solidworksWorkshop: Workshop = {
    id: '11111111-1111-4111-8111-111111111101',
    slug: 'solidworks-cad-bootcamp',
    title: 'Industrial SolidWorks 3D CAD & Product Design Bootcamp',
    subtitle:
      'Master parametric part modeling, mechanical assemblies, GD&T drafting, and design-for-manufacturing in 3 intensive live sessions.',
    type: 'LIVE_WORKSHOP',
    description:
      'A hands-on engineering workshop crafted for mechanical, automotive, aerospace, and product design students and professionals. Move beyond basic tutorials and build production-grade parametric assemblies with industry-standard design intent.',
    highlights: [
      'Live interactive CAD modeling from first principles',
      'Parametric sketching, design tables & failure-proof feature trees',
      'Multi-component mechanical assemblies with mates & motion checks',
      '2D manufacturing drawings with tolerances, BOMs & GD&T callouts',
      'Direct Q&A and portfolio project feedback inside the private Telegram cohort',
    ],
    prerequisites: [
      'Windows PC or Laptop (8GB RAM minimum, 16GB recommended)',
      'SolidWorks 2021 or newer installed (setup guide shared in Telegram group)',
      'Basic familiarity with engineering drawing views',
    ],
    deliverables: [
      '3 Live Mentor-Led Engineering Sessions (6+ Hours Total)',
      'Complete SolidWorks Part & Assembly Source Files',
      'Industry CAD Checklist & Design Intent Handbook',
      'Verified C-Spot Academy Certificate of Completion',
      'Private Cohort Telegram Group Access',
    ],
    price_inr: 499,
    original_price_inr: 1999,
    currency: 'INR',
    start_date: startDate,
    end_date: endDate,
    schedule_summary: 'Fri, Sat & Sun • 7:00 PM – 9:15 PM IST',
    mode: 'Live Online + Hands-On CAD Labs',
    max_seats: 120,
    seats_filled: 34,
    is_active: true,
    is_featured: true,
    registration_open: true,
    instructor_name: 'C-Spot Lead Mechanical Design Engineers',
    instructor_bio:
      'Practicing product design and CAD engineers with 8+ years of experience shipping industrial machinery, EV enclosures, and precision mechanical systems.',
    created_at: now,
    updated_at: now,
  };

  const advancedCourse: Workshop = {
    id: '22222222-2222-4222-8222-222222222202',
    slug: 'advanced-product-design-dfm',
    title: 'Advanced Product Design, Sheet Metal, Surfacing & DFM Track',
    subtitle:
      'A 6-week cohort-based specialization taking you from CAD operator to industry-ready Mechanical Product Design Engineer.',
    type: 'ADVANCED_COURSE',
    description:
      'Designed for graduates of our SolidWorks Bootcamp and practicing engineers seeking mastery in complex surfacing, sheet-metal enclosures, tolerance stack-up analysis, and real-world vendor manufacturing workflows.',
    highlights: [
      'Class-A Hybrid Surface Modeling for Consumer & EV Hardware',
      'Sheet Metal Bend Allowances, K-Factor & Flat Pattern DXF Exports',
      '1D/2D Tolerance Stack-Up Analysis & GD&T per ASME Y14.5',
      '1-on-1 Capstone Project Reviews & Mock Technical Interviews',
    ],
    prerequisites: [
      'Completion of SolidWorks CAD Bootcamp or equivalent 3D CAD experience',
    ],
    deliverables: [
      '6 Weeks of Live Weekend Mentorship & Design Reviews',
      '3 Industry-Grade Capstone Hardware Projects',
      'Placement & Portfolio Review Support',
    ],
    price_inr: 7999,
    original_price_inr: 14999,
    currency: 'INR',
    start_date: null,
    end_date: null,
    schedule_summary: '6 Weeks • Weekend Live Cohort (Next Batch Opening Soon)',
    mode: 'Cohort Live + 1-on-1 Design Critiques',
    max_seats: 40,
    seats_filled: 0,
    is_active: true,
    is_featured: false,
    registration_open: false,
    instructor_name: 'C-Spot Senior Product Architects',
    instructor_bio: null,
    created_at: now,
    updated_at: now,
  };

  const workshopDays: WorkshopDay[] = [
    {
      id: '33333333-3333-4333-8333-333333333301',
      workshop_id: solidworksWorkshop.id,
      day_number: 1,
      title: 'Parametric Sketching, Design Intent & Core Part Modeling',
      summary:
        'Build rock-solid sketches and feature trees that never break when dimensions change.',
      session_date: 'Day 1 • Friday (7:00 PM – 9:15 PM IST)',
      duration_minutes: 135,
      topics: [
        'Understanding Design Intent & Parametric Constraints',
        'Fully Defined Sketches, Reference Geometry & Construction Planes',
        'Extrude, Revolve, Sweep, Loft & Shell Workflows',
        'Draft Angles, Fillets & Design for Injection Molding / CNC',
      ],
      hands_on_project: 'Precision Cast Gearbox Housing & Mounting Bracket',
      created_at: now,
      updated_at: now,
    },
    {
      id: '33333333-3333-4333-8333-333333333302',
      workshop_id: solidworksWorkshop.id,
      day_number: 2,
      title: 'Bottom-Up & Top-Down Assemblies, Mates & Interference Detection',
      summary:
        'Assemble complex multi-part mechanisms with realistic mechanical constraints and collision checks.',
      session_date: 'Day 2 • Saturday (7:00 PM – 9:15 PM IST)',
      duration_minutes: 135,
      topics: [
        'Sub-Assembly Architecture & Origin Alignment',
        'Standard, Advanced & Mechanical Mates (Gear, Cam, Slot)',
        'Clearance Verification, Hole Alignment & Interference Detection',
        'Exploded Views & Bill of Materials (BOM) Preparation',
      ],
      hands_on_project: 'Industrial Belt-Tensioner & Rotary Actuator Assembly',
      created_at: now,
      updated_at: now,
    },
    {
      id: '33333333-3333-4333-8333-333333333303',
      workshop_id: solidworksWorkshop.id,
      day_number: 3,
      title: 'Production 2D Drawings, GD&T Essentials & Portfolio Capstone',
      summary:
        'Translate 3D CAD models into shop-floor-ready manufacturing drawings.',
      session_date: 'Day 3 • Sunday (7:00 PM – 9:15 PM IST)',
      duration_minutes: 135,
      topics: [
        'Orthographic, Section, Detail & Broken-Out Section Views',
        'Datum Selection, Fits, Limits & Core GD&T Feature Control Frames',
        'Automated Ballooning, BOM Tables & Revision Blocks',
        'Portfolio Presentation & Career Roadmap in CAD/Product Design',
      ],
      hands_on_project: 'Complete Shop-Floor Manufacturing Drawing Package (PDF + DWG)',
      created_at: now,
      updated_at: now,
    },
  ];

  const defaultTelegramUrl =
    process.env.TELEGRAM_GROUP_INVITE_URL ||
    'https://t.me/cspotofficial';

  return {
    workshops: [solidworksWorkshop, advancedCourse],
    workshopDays,
    registrations: [],
    paymentOrders: [],
    paymentTransactions: [],
    workshopAccess: [],
    systemSettings: {
      telegram_group_invite_url: {
        key: 'telegram_group_invite_url',
        value: defaultTelegramUrl,
        description: 'Private Telegram cohort invite URL for verified PAID students',
        is_secret: true,
        updated_by: 'system_seed',
        updated_at: now,
      },
      telegram_access_enabled: {
        key: 'telegram_access_enabled',
        value: 'true',
        description: 'Global toggle for Telegram invite dispensing',
        is_secret: false,
        updated_by: 'system_seed',
        updated_at: now,
      },
    },
    auditLogs: [],
    lookupOtps: [],
  };
}

const globalForDb = globalThis as unknown as {
  __cspotMemoryStore?: MemoryStore;
};

function getMemoryStore(): MemoryStore {
  if (!globalForDb.__cspotMemoryStore) {
    globalForDb.__cspotMemoryStore = createInitialMemoryStore();
  }
  return globalForDb.__cspotMemoryStore;
}

export const db = {
  async listActiveWorkshops(): Promise<Workshop[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw new Error(`Failed to fetch workshops: ${error.message}`);
      return (data as Workshop[]) || [];
    }

    return getMemoryStore().workshops.filter((w) => w.is_active);
  },

  async listAllWorkshopsAdmin(): Promise<Workshop[]> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw new Error(`Failed to fetch admin workshops: ${error.message}`);
      return (data as Workshop[]) || [];
    }

    return [...getMemoryStore().workshops];
  },

  async getWorkshopBySlug(slug: string): Promise<WorkshopWithCurriculum | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data: workshop, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !workshop) return null;

      const { data: days } = await supabase
        .from('workshop_days')
        .select('*')
        .eq('workshop_id', workshop.id)
        .order('day_number', { ascending: true });

      return {
        ...(workshop as Workshop),
        days: (days as WorkshopDay[]) || [],
      };
    }

    const store = getMemoryStore();
    const workshop = store.workshops.find((w) => w.slug === slug);
    if (!workshop) return null;

    const days = store.workshopDays
      .filter((d) => d.workshop_id === workshop.id)
      .sort((a, b) => a.day_number - b.day_number);

    return { ...workshop, days };
  },

  async getWorkshopById(id: string): Promise<Workshop | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return null;
      return data as Workshop;
    }

    return getMemoryStore().workshops.find((w) => w.id === id) || null;
  },

  async updateWorkshop(
    workshopId: string,
    updates: Partial<Workshop>
  ): Promise<Workshop | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('workshops')
        .update(updates)
        .eq('id', workshopId)
        .select('*')
        .single();
      if (error) throw new Error(`Workshop update failed: ${error.message}`);
      return data as Workshop;
    }

    const store = getMemoryStore();
    const idx = store.workshops.findIndex((w) => w.id === workshopId);
    if (idx === -1) return null;
    store.workshops[idx] = {
      ...store.workshops[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return store.workshops[idx];
  },

  async findPaidRegistrationByEmail(
    workshopId: string,
    email: string
  ): Promise<Registration | null> {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('workshop_id', workshopId)
        .ilike('email', normalizedEmail)
        .eq('status', 'PAID')
        .maybeSingle();
      return (data as Registration) || null;
    }

    return (
      getMemoryStore().registrations.find(
        (r) =>
          r.workshop_id === workshopId &&
          r.email.toLowerCase() === normalizedEmail &&
          r.status === 'PAID'
      ) || null
    );
  },

  async findPendingRegistrationByEmail(
    workshopId: string,
    email: string
  ): Promise<Registration | null> {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('workshop_id', workshopId)
        .ilike('email', normalizedEmail)
        .eq('status', 'PENDING_PAYMENT')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data as Registration) || null;
    }

    const matches = getMemoryStore().registrations.filter(
      (r) =>
        r.workshop_id === workshopId &&
        r.email.toLowerCase() === normalizedEmail &&
        r.status === 'PENDING_PAYMENT'
    );
    return matches[matches.length - 1] || null;
  },

  async upsertPendingRegistration(params: {
    workshopId: string;
    fullName: string;
    email: string;
    phone: string;
    collegeOrCompany: string;
    departmentOrRole?: string;
    experienceLevel: string;
    city?: string;
    referralSource?: string;
    amountDueInr: number;
  }): Promise<Registration> {
    const existingPending = await this.findPendingRegistrationByEmail(
      params.workshopId,
      params.email
    );

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();

      if (existingPending) {
        const { data, error } = await supabase
          .from('registrations')
          .update({
            full_name: params.fullName,
            phone: params.phone,
            college_or_company: params.collegeOrCompany,
            department_or_role: params.departmentOrRole || null,
            experience_level: params.experienceLevel,
            city: params.city || null,
            referral_source: params.referralSource || null,
            amount_due_inr: params.amountDueInr,
          })
          .eq('id', existingPending.id)
          .select('*')
          .single();

        if (error) throw new Error(`Failed to update registration: ${error.message}`);
        return data as Registration;
      }

      const { data, error } = await supabase
        .from('registrations')
        .insert({
          registration_code: createRegCode(),
          workshop_id: params.workshopId,
          full_name: params.fullName,
          email: params.email.toLowerCase(),
          phone: params.phone,
          college_or_company: params.collegeOrCompany,
          department_or_role: params.departmentOrRole || null,
          experience_level: params.experienceLevel,
          city: params.city || null,
          referral_source: params.referralSource || null,
          status: 'PENDING_PAYMENT',
          amount_due_inr: params.amountDueInr,
          amount_paid_inr: 0,
        })
        .select('*')
        .single();

      if (error) throw new Error(`Failed to create registration: ${error.message}`);
      return data as Registration;
    }

    const store = getMemoryStore();
    const now = new Date().toISOString();

    if (existingPending) {
      const idx = store.registrations.findIndex((r) => r.id === existingPending.id);
      store.registrations[idx] = {
        ...store.registrations[idx],
        full_name: params.fullName,
        phone: params.phone,
        college_or_company: params.collegeOrCompany,
        department_or_role: params.departmentOrRole || null,
        experience_level: params.experienceLevel,
        city: params.city || null,
        referral_source: params.referralSource || null,
        amount_due_inr: params.amountDueInr,
        updated_at: now,
      };
      return store.registrations[idx];
    }

    const newRegistration: Registration = {
      id: crypto.randomUUID(),
      registration_code: createRegCode(),
      workshop_id: params.workshopId,
      full_name: params.fullName,
      email: params.email.toLowerCase(),
      phone: params.phone,
      college_or_company: params.collegeOrCompany,
      department_or_role: params.departmentOrRole || null,
      experience_level: params.experienceLevel,
      city: params.city || null,
      referral_source: params.referralSource || null,
      status: 'PENDING_PAYMENT',
      amount_due_inr: params.amountDueInr,
      amount_paid_inr: 0,
      paid_at: null,
      notes: null,
      created_at: now,
      updated_at: now,
    };

    store.registrations.push(newRegistration);
    return newRegistration;
  },

  async getRegistrationById(id: string): Promise<Registration | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return null;
      return data as Registration;
    }

    return getMemoryStore().registrations.find((r) => r.id === id) || null;
  },

  async getRegistrationsByEmail(email: string): Promise<Registration[]> {
    const normalized = email.trim().toLowerCase();
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .ilike('email', normalized)
        .order('created_at', { ascending: false });
      return (data as Registration[]) || [];
    }

    return getMemoryStore().registrations.filter(
      (r) => r.email.toLowerCase() === normalized
    );
  },

  async createPaymentOrder(params: {
    orderId: string;
    cfOrderId: string | null;
    registrationId: string;
    workshopId: string;
    amount: number;
    currency: string;
    status: PaymentOrderStatus;
    paymentSessionId: string | null;
    cfOrderExpiry?: string | null;
    gatewayResponse?: Record<string, unknown>;
  }): Promise<PaymentOrder> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('payment_orders')
        .insert({
          order_id: params.orderId,
          cf_order_id: params.cfOrderId,
          registration_id: params.registrationId,
          workshop_id: params.workshopId,
          amount: params.amount,
          currency: params.currency,
          status: params.status,
          payment_session_id: params.paymentSessionId,
          cf_order_expiry: params.cfOrderExpiry || null,
          gateway_response: params.gatewayResponse || {},
        })
        .select('*')
        .single();

      if (error) throw new Error(`Failed to persist payment order: ${error.message}`);
      return data as PaymentOrder;
    }

    const now = new Date().toISOString();
    const order: PaymentOrder = {
      id: crypto.randomUUID(),
      order_id: params.orderId,
      cf_order_id: params.cfOrderId,
      registration_id: params.registrationId,
      workshop_id: params.workshopId,
      amount: params.amount,
      currency: params.currency,
      status: params.status,
      payment_session_id: params.paymentSessionId,
      cf_order_expiry: params.cfOrderExpiry || null,
      gateway_response: params.gatewayResponse || {},
      created_at: now,
      updated_at: now,
    };
    getMemoryStore().paymentOrders.push(order);
    return order;
  },

  async getPaymentOrderByOrderId(orderId: string): Promise<PaymentOrder | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('order_id', orderId)
        .single();
      if (error || !data) return null;
      return data as PaymentOrder;
    }

    return (
      getMemoryStore().paymentOrders.find((o) => o.order_id === orderId) || null
    );
  },

  async recordVerifiedPaymentAndGrantAccess(params: {
    orderId: string;
    cfPaymentId: string;
    webhookEventId?: string | null;
    amount: number;
    currency: string;
    paymentMethod?: string | null;
    bankReference?: string | null;
    paymentTime?: string | null;
    verificationSource: VerificationSource;
    rawPayload: Record<string, unknown>;
  }): Promise<{
    registration: Registration;
    access: WorkshopAccess;
    alreadyProcessed: boolean;
  }> {
    const order = await this.getPaymentOrderByOrderId(params.orderId);
    if (!order) {
      throw new Error(`Payment order not found for orderId: ${params.orderId}`);
    }

    const registration = await this.getRegistrationById(order.registration_id);
    if (!registration) {
      throw new Error(`Registration not found for orderId: ${params.orderId}`);
    }

    if (params.amount < order.amount || params.currency !== order.currency) {
      throw new Error(
        `Payment amount/currency mismatch. Expected ${order.currency} ${order.amount}, got ${params.currency} ${params.amount}`
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();

      const { data: existingTxn } = await supabase
        .from('payment_transactions')
        .select('id')
        .eq('cf_payment_id', params.cfPaymentId)
        .maybeSingle();

      const alreadyProcessed = Boolean(existingTxn) || registration.status === 'PAID';

      if (!existingTxn) {
        const { error: txnErr } = await supabase.from('payment_transactions').insert({
          payment_order_id: order.id,
          registration_id: registration.id,
          cf_payment_id: params.cfPaymentId,
          webhook_event_id: params.webhookEventId || null,
          amount: params.amount,
          currency: params.currency,
          status: 'SUCCESS' satisfies PaymentTxnStatus,
          payment_method: params.paymentMethod || null,
          bank_reference: params.bankReference || null,
          payment_time: params.paymentTime || new Date().toISOString(),
          verification_source: params.verificationSource,
          raw_payload: params.rawPayload,
        });

        if (txnErr && !txnErr.message.includes('duplicate key')) {
          throw new Error(`Failed to record transaction: ${txnErr.message}`);
        }
      }

      await supabase
        .from('payment_orders')
        .update({ status: 'PAID' })
        .eq('id', order.id);

      let updatedReg = registration;
      if (registration.status !== 'PAID') {
        const { data: regData, error: regErr } = await supabase
          .from('registrations')
          .update({
            status: 'PAID',
            amount_paid_inr: params.amount,
            paid_at: params.paymentTime || new Date().toISOString(),
          })
          .eq('id', registration.id)
          .select('*')
          .single();

        if (regErr) throw new Error(`Failed to update registration: ${regErr.message}`);
        updatedReg = regData as Registration;

        const workshop = await this.getWorkshopById(registration.workshop_id);
        if (workshop) {
          await supabase
            .from('workshops')
            .update({ seats_filled: workshop.seats_filled + 1 })
            .eq('id', workshop.id);
        }
      }

      const { data: existingAccess } = await supabase
        .from('workshop_access')
        .select('*')
        .eq('registration_id', registration.id)
        .maybeSingle();

      if (existingAccess) {
        return {
          registration: updatedReg,
          access: existingAccess as WorkshopAccess,
          alreadyProcessed,
        };
      }

      const { data: newAccess, error: accessErr } = await supabase
        .from('workshop_access')
        .insert({
          registration_id: registration.id,
          workshop_id: registration.workshop_id,
          access_token_hash: createNonce(),
          is_granted: true,
        })
        .select('*')
        .single();

      if (accessErr) throw new Error(`Failed to grant workshop access: ${accessErr.message}`);

      return {
        registration: updatedReg,
        access: newAccess as WorkshopAccess,
        alreadyProcessed,
      };
    }

    const store = getMemoryStore();
    const now = new Date().toISOString();

    const existingTxn = store.paymentTransactions.find(
      (t) => t.cf_payment_id === params.cfPaymentId
    );
    const alreadyProcessed = Boolean(existingTxn) || registration.status === 'PAID';

    if (!existingTxn) {
      store.paymentTransactions.push({
        id: crypto.randomUUID(),
        payment_order_id: order.id,
        registration_id: registration.id,
        cf_payment_id: params.cfPaymentId,
        webhook_event_id: params.webhookEventId || null,
        amount: params.amount,
        currency: params.currency,
        status: 'SUCCESS',
        payment_method: params.paymentMethod || null,
        bank_reference: params.bankReference || null,
        payment_time: params.paymentTime || now,
        verification_source: params.verificationSource,
        raw_payload: params.rawPayload,
        created_at: now,
      });
    }

    const orderIdx = store.paymentOrders.findIndex((o) => o.id === order.id);
    if (orderIdx !== -1) {
      store.paymentOrders[orderIdx].status = 'PAID';
      store.paymentOrders[orderIdx].updated_at = now;
    }

    const regIdx = store.registrations.findIndex((r) => r.id === registration.id);
    if (regIdx !== -1 && store.registrations[regIdx].status !== 'PAID') {
      store.registrations[regIdx] = {
        ...store.registrations[regIdx],
        status: 'PAID',
        amount_paid_inr: params.amount,
        paid_at: params.paymentTime || now,
        updated_at: now,
      };

      const wsIdx = store.workshops.findIndex(
        (w) => w.id === registration.workshop_id
      );
      if (wsIdx !== -1) {
        store.workshops[wsIdx].seats_filled += 1;
      }
    }

    let access = store.workshopAccess.find(
      (a) => a.registration_id === registration.id
    );
    if (!access) {
      access = {
        id: crypto.randomUUID(),
        registration_id: registration.id,
        workshop_id: registration.workshop_id,
        access_token_hash: createNonce(),
        is_granted: true,
        revoked_at: null,
        revoked_reason: null,
        telegram_link_revealed_count: 0,
        last_accessed_at: null,
        granted_at: now,
        updated_at: now,
      };
      store.workshopAccess.push(access);
    }

    return {
      registration: store.registrations[regIdx],
      access,
      alreadyProcessed,
    };
  },

  async manuallyMarkRegistrationPaid(params: {
    registrationId: string;
    adminIdentifier: string;
    reason?: string;
  }): Promise<{ registration: Registration; access: WorkshopAccess } | null> {
    const registration = await this.getRegistrationById(params.registrationId);
    if (!registration) return null;

    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      let updatedReg = registration;

      if (registration.status !== 'PAID') {
        const { data } = await supabase
          .from('registrations')
          .update({
            status: 'PAID',
            amount_paid_inr: registration.amount_due_inr,
            paid_at: now,
            notes: params.reason || `Manually marked PAID by ${params.adminIdentifier}`,
          })
          .eq('id', registration.id)
          .select('*')
          .single();

        if (data) updatedReg = data as Registration;
      }

      const existing = await this.getWorkshopAccessByRegistrationId(registration.id);
      if (existing) {
        const { data: acc } = await supabase
          .from('workshop_access')
          .update({ is_granted: true, revoked_at: null, revoked_reason: null })
          .eq('id', existing.id)
          .select('*')
          .single();
        return { registration: updatedReg, access: acc as WorkshopAccess };
      }

      const { data: createdAcc } = await supabase
        .from('workshop_access')
        .insert({
          registration_id: registration.id,
          workshop_id: registration.workshop_id,
          access_token_hash: createNonce(),
          is_granted: true,
        })
        .select('*')
        .single();

      return { registration: updatedReg, access: createdAcc as WorkshopAccess };
    }

    const store = getMemoryStore();
    const rIdx = store.registrations.findIndex((r) => r.id === registration.id);
    if (rIdx !== -1 && store.registrations[rIdx].status !== 'PAID') {
      store.registrations[rIdx].status = 'PAID';
      store.registrations[rIdx].amount_paid_inr = registration.amount_due_inr;
      store.registrations[rIdx].paid_at = now;
      store.registrations[rIdx].notes =
        params.reason || `Manually marked PAID by ${params.adminIdentifier}`;
      store.registrations[rIdx].updated_at = now;
    }

    const access = await this.updateWorkshopAccessControl({
      registrationId: registration.id,
      action: 'GRANT_ACCESS',
    });

    if (!access) return null;
    return { registration: store.registrations[rIdx], access };
  },

  async markPaymentFailed(orderId: string, reason?: string): Promise<void> {
    const order = await this.getPaymentOrderByOrderId(orderId);
    if (!order || order.status === 'PAID') return;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('payment_orders')
        .update({ status: 'FAILED' })
        .eq('id', order.id);

      await supabase
        .from('registrations')
        .update({ status: 'FAILED', notes: reason || 'Payment failed at gateway' })
        .eq('id', order.registration_id)
        .eq('status', 'PENDING_PAYMENT');
      return;
    }

    const store = getMemoryStore();
    const oIdx = store.paymentOrders.findIndex((o) => o.id === order.id);
    if (oIdx !== -1) store.paymentOrders[oIdx].status = 'FAILED';

    const rIdx = store.registrations.findIndex(
      (r) => r.id === order.registration_id && r.status === 'PENDING_PAYMENT'
    );
    if (rIdx !== -1) {
      store.registrations[rIdx].status = 'FAILED';
      store.registrations[rIdx].notes = reason || 'Payment failed at gateway';
    }
  },

  async getWorkshopAccessByRegistrationId(
    registrationId: string
  ): Promise<WorkshopAccess | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('workshop_access')
        .select('*')
        .eq('registration_id', registrationId)
        .maybeSingle();
      if (error || !data) return null;
      return data as WorkshopAccess;
    }

    return (
      getMemoryStore().workshopAccess.find(
        (a) => a.registration_id === registrationId
      ) || null
    );
  },

  async recordTelegramLinkReveal(accessId: string): Promise<void> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('workshop_access')
        .select('telegram_link_revealed_count')
        .eq('id', accessId)
        .single();

      const currentCount = data?.telegram_link_revealed_count ?? 0;
      await supabase
        .from('workshop_access')
        .update({
          telegram_link_revealed_count: currentCount + 1,
          last_accessed_at: now,
        })
        .eq('id', accessId);
      return;
    }

    const store = getMemoryStore();
    const idx = store.workshopAccess.findIndex((a) => a.id === accessId);
    if (idx !== -1) {
      store.workshopAccess[idx].telegram_link_revealed_count += 1;
      store.workshopAccess[idx].last_accessed_at = now;
    }
  },

  async updateWorkshopAccessControl(params: {
    registrationId: string;
    action: 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'ROTATE_TOKEN';
    reason?: string;
  }): Promise<WorkshopAccess | null> {
    const now = new Date().toISOString();
    const reg = await this.getRegistrationById(params.registrationId);
    if (!reg) return null;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const existing = await this.getWorkshopAccessByRegistrationId(params.registrationId);

      if (!existing && params.action === 'GRANT_ACCESS') {
        const { data } = await supabase
          .from('workshop_access')
          .insert({
            registration_id: reg.id,
            workshop_id: reg.workshop_id,
            access_token_hash: createNonce(),
            is_granted: true,
          })
          .select('*')
          .single();
        return (data as WorkshopAccess) || null;
      }

      if (!existing) return null;

      const patch: Partial<WorkshopAccess> = {};
      if (params.action === 'REVOKE_ACCESS') {
        patch.is_granted = false;
        patch.revoked_at = now;
        patch.revoked_reason = params.reason || 'Revoked by administrator';
      } else if (params.action === 'GRANT_ACCESS') {
        patch.is_granted = true;
        patch.revoked_at = null;
        patch.revoked_reason = null;
      } else if (params.action === 'ROTATE_TOKEN') {
        patch.access_token_hash = createNonce();
      }

      const { data } = await supabase
        .from('workshop_access')
        .update(patch)
        .eq('id', existing.id)
        .select('*')
        .single();
      return (data as WorkshopAccess) || null;
    }

    const store = getMemoryStore();
    const idx = store.workshopAccess.findIndex(
      (a) => a.registration_id === params.registrationId
    );

    if (idx === -1 && params.action === 'GRANT_ACCESS') {
      const created: WorkshopAccess = {
        id: crypto.randomUUID(),
        registration_id: reg.id,
        workshop_id: reg.workshop_id,
        access_token_hash: createNonce(),
        is_granted: true,
        revoked_at: null,
        revoked_reason: null,
        telegram_link_revealed_count: 0,
        last_accessed_at: null,
        granted_at: now,
        updated_at: now,
      };
      store.workshopAccess.push(created);
      return created;
    }

    if (idx === -1) return null;

    if (params.action === 'REVOKE_ACCESS') {
      store.workshopAccess[idx].is_granted = false;
      store.workshopAccess[idx].revoked_at = now;
      store.workshopAccess[idx].revoked_reason =
        params.reason || 'Revoked by administrator';
    } else if (params.action === 'GRANT_ACCESS') {
      store.workshopAccess[idx].is_granted = true;
      store.workshopAccess[idx].revoked_at = null;
      store.workshopAccess[idx].revoked_reason = null;
    } else if (params.action === 'ROTATE_TOKEN') {
      store.workshopAccess[idx].access_token_hash = createNonce();
    }
    store.workshopAccess[idx].updated_at = now;
    return store.workshopAccess[idx];
  },

  async createLookupOtp(email: string, otpHash: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      await supabase.from('lookup_otps').insert({
        email: normalized,
        otp_hash: otpHash,
        expires_at: expiresAt,
      });
      return;
    }

    getMemoryStore().lookupOtps.push({
      id: crypto.randomUUID(),
      email: normalized,
      otp_hash: otpHash,
      attempts: 0,
      expires_at: expiresAt,
      verified_at: null,
      created_at: new Date().toISOString(),
    });
  },

  async verifyLookupOtp(email: string, otpHash: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('lookup_otps')
        .select('*')
        .ilike('email', normalized)
        .is('verified_at', null)
        .gt('expires_at', nowIso)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data || data.attempts >= 5) return false;

      if (data.otp_hash !== otpHash) {
        await supabase
          .from('lookup_otps')
          .update({ attempts: data.attempts + 1 })
          .eq('id', data.id);
        return false;
      }

      await supabase
        .from('lookup_otps')
        .update({ verified_at: nowIso })
        .eq('id', data.id);
      return true;
    }

    const store = getMemoryStore();
    const candidates = store.lookupOtps
      .filter(
        (o) =>
          o.email === normalized &&
          o.verified_at === null &&
          o.expires_at > nowIso
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    const latest = candidates[0];
    if (!latest || latest.attempts >= 5) return false;

    if (latest.otp_hash !== otpHash) {
      latest.attempts += 1;
      return false;
    }

    latest.verified_at = nowIso;
    return true;
  },

  async getSystemSetting(key: string): Promise<string | null> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      return data?.value ?? null;
    }

    return getMemoryStore().systemSettings[key]?.value ?? null;
  },

  async setSystemSetting(
    key: string,
    value: string,
    updatedBy: string
  ): Promise<void> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      await supabase.from('system_settings').upsert({
        key,
        value,
        updated_by: updatedBy,
        updated_at: now,
      });
      return;
    }

    const store = getMemoryStore();
    store.systemSettings[key] = {
      key,
      value,
      description: store.systemSettings[key]?.description || null,
      is_secret: key === 'telegram_group_invite_url',
      updated_by: updatedBy,
      updated_at: now,
    };
  },

  async logAdminAction(params: {
    adminIdentifier: string;
    action: string;
    targetType: string;
    targetId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      await supabase.from('admin_audit_logs').insert({
        admin_identifier: params.adminIdentifier,
        action: params.action,
        target_type: params.targetType,
        target_id: params.targetId,
        metadata: params.metadata || {},
      });
      return;
    }

    getMemoryStore().auditLogs.unshift({
      id: crypto.randomUUID(),
      admin_identifier: params.adminIdentifier,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId,
      metadata: params.metadata || {},
      ip_address: null,
      created_at: new Date().toISOString(),
    });
  },

  async getAdminDashboardData(): Promise<{
    stats: AdminDashboardStats;
    registrations: Array<
      Registration & { workshop_title: string; has_telegram_access: boolean }
    >;
    transactions: PaymentTransaction[];
    auditLogs: AdminAuditLog[];
  }> {
    const workshops = await this.listAllWorkshopsAdmin();
    const workshopMap = new Map(workshops.map((w) => [w.id, w.title]));

    let registrations: Registration[] = [];
    let accessList: WorkshopAccess[] = [];
    let transactions: PaymentTransaction[] = [];
    let auditLogs: AdminAuditLog[] = [];

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const [regRes, accRes, txnRes, logRes] = await Promise.all([
        supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('workshop_access').select('*'),
        supabase
          .from('payment_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('admin_audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      registrations = (regRes.data as Registration[]) || [];
      accessList = (accRes.data as WorkshopAccess[]) || [];
      transactions = (txnRes.data as PaymentTransaction[]) || [];
      auditLogs = (logRes.data as AdminAuditLog[]) || [];
    } else {
      const store = getMemoryStore();
      registrations = [...store.registrations].sort(
        (a, b) => b.created_at.localeCompare(a.created_at)
      );
      accessList = [...store.workshopAccess];
      transactions = [...store.paymentTransactions].sort(
        (a, b) => b.created_at.localeCompare(a.created_at)
      );
      auditLogs = [...store.auditLogs];
    }

    const accessMap = new Map(
      accessList.map((a) => [a.registration_id, a.is_granted])
    );

    const enrichedRegistrations = registrations.map((r) => ({
      ...r,
      workshop_title: workshopMap.get(r.workshop_id) || 'Workshop',
      has_telegram_access: Boolean(accessMap.get(r.id)),
    }));

    const paidRegs = enrichedRegistrations.filter((r) => r.status === 'PAID');
    const pendingRegs = enrichedRegistrations.filter(
      (r) => r.status === 'PENDING_PAYMENT'
    );
    const totalRevenueInr = paidRegs.reduce(
      (sum, r) => sum + (r.amount_paid_inr || 0),
      0
    );

    return {
      stats: {
        totalRegistrations: enrichedRegistrations.length,
        paidRegistrations: paidRegs.length,
        pendingRegistrations: pendingRegs.length,
        totalRevenueInr,
        activeWorkshopsCount: workshops.filter((w) => w.is_active).length,
        telegramAccessGrantedCount: accessList.filter((a) => a.is_granted).length,
        recentRegistrations: enrichedRegistrations.slice(0, 10),
      },
      registrations: enrichedRegistrations,
      transactions,
      auditLogs,
    };
  },
};
