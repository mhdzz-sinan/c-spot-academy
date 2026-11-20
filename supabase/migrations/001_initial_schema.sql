-- ============================================================================
-- C-Spot Academy — Initial PostgreSQL Schema, Indexes, Triggers & RLS Policies
-- Migration: 001_initial_schema.sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CUSTOM ENUM TYPES
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE workshop_type AS ENUM ('LIVE_WORKSHOP', 'ADVANCED_COURSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM (
        'PENDING_PAYMENT',
        'PAID',
        'FAILED',
        'CANCELLED',
        'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_order_status AS ENUM (
        'CREATED',
        'ACTIVE',
        'PAID',
        'EXPIRED',
        'FAILED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_txn_status AS ENUM (
        'SUCCESS',
        'FAILED',
        'PENDING',
        'USER_DROPPED',
        'FLAGGED',
        'VOID'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. TRIGGER FUNCTION FOR AUTOMATIC updated_at TIMESTAMPS
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- 3.1 Workshops & Courses Catalog
CREATE TABLE IF NOT EXISTS public.workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    type workshop_type NOT NULL DEFAULT 'LIVE_WORKSHOP',
    description TEXT NOT NULL,
    highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
    deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
    price_inr INTEGER NOT NULL CHECK (price_inr >= 0),
    original_price_inr INTEGER CHECK (original_price_inr IS NULL OR original_price_inr >= price_inr),
    currency TEXT NOT NULL DEFAULT 'INR',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    schedule_summary TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'Live Online + Hands-On CAD Labs',
    max_seats INTEGER NOT NULL DEFAULT 100 CHECK (max_seats > 0),
    seats_filled INTEGER NOT NULL DEFAULT 0 CHECK (seats_filled >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    registration_open BOOLEAN NOT NULL DEFAULT TRUE,
    instructor_name TEXT NOT NULL DEFAULT 'C-Spot Engineering Faculty',
    instructor_bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_workshops_updated_at
    BEFORE UPDATE ON public.workshops
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3.2 Day-by-Day Workshop Curriculum
CREATE TABLE IF NOT EXISTS public.workshop_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number > 0),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    session_date TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 120,
    topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    hands_on_project TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workshop_id, day_number)
);

CREATE TRIGGER trg_workshop_days_updated_at
    BEFORE UPDATE ON public.workshop_days
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3.3 Student Registrations
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_code TEXT NOT NULL UNIQUE,
    workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college_or_company TEXT NOT NULL,
    department_or_role TEXT,
    experience_level TEXT NOT NULL DEFAULT 'BEGINNER',
    city TEXT,
    referral_source TEXT,
    status registration_status NOT NULL DEFAULT 'PENDING_PAYMENT',
    amount_due_inr INTEGER NOT NULL CHECK (amount_due_inr >= 0),
    amount_paid_inr INTEGER NOT NULL DEFAULT 0 CHECK (amount_paid_inr >= 0),
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registrations_workshop_id ON public.registrations(workshop_id);
CREATE INDEX idx_registrations_email_lower ON public.registrations(LOWER(email));
CREATE INDEX idx_registrations_phone ON public.registrations(phone);
CREATE INDEX idx_registrations_status ON public.registrations(status);

-- Prevent duplicate PAID registrations for the same email & workshop
CREATE UNIQUE INDEX idx_unique_paid_registration_per_workshop
    ON public.registrations(workshop_id, LOWER(email))
    WHERE status = 'PAID';

CREATE TRIGGER trg_registrations_updated_at
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3.4 Cashfree Payment Orders
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL UNIQUE,
    cf_order_id TEXT UNIQUE,
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE RESTRICT,
    amount INTEGER NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status payment_order_status NOT NULL DEFAULT 'CREATED',
    payment_session_id TEXT,
    cf_order_expiry TIMESTAMPTZ,
    gateway_response JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_orders_registration_id ON public.payment_orders(registration_id);
CREATE INDEX idx_payment_orders_status ON public.payment_orders(status);

CREATE TRIGGER trg_payment_orders_updated_at
    BEFORE UPDATE ON public.payment_orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3.5 Verified Payment Transactions (Webhook & Server Verification Ledger)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_order_id UUID NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    cf_payment_id TEXT NOT NULL UNIQUE,
    webhook_event_id TEXT UNIQUE,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status payment_txn_status NOT NULL,
    payment_method TEXT,
    bank_reference TEXT,
    payment_time TIMESTAMPTZ,
    verification_source TEXT NOT NULL DEFAULT 'WEBHOOK',
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_txns_order_id ON public.payment_transactions(payment_order_id);
CREATE INDEX idx_payment_txns_registration_id ON public.payment_transactions(registration_id);

-- 3.6 Protected Workshop & Telegram Access Control
CREATE TABLE IF NOT EXISTS public.workshop_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
    workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
    access_token_hash TEXT NOT NULL UNIQUE,
    is_granted BOOLEAN NOT NULL DEFAULT TRUE,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    telegram_link_revealed_count INTEGER NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workshop_access_token_hash ON public.workshop_access(access_token_hash);

CREATE TRIGGER trg_workshop_access_updated_at
    BEFORE UPDATE ON public.workshop_access
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3.7 System Settings (Key-Value Store for Telegram Invite Link & Feature Flags)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    is_secret BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3.8 Admin Users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'SUPPORT')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3.9 Admin Audit Logs (Manual Overrides, Link Rotations, Access Revocations)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_identifier TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- 3.10 Secure Registration Lookup OTPs
CREATE TABLE IF NOT EXISTS public.lookup_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lookup_otps_email ON public.lookup_otps(LOWER(email));

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) — ZERO CLIENT TRUST ARCHITECTURE
-- ============================================================================
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_otps ENABLE ROW LEVEL SECURITY;

-- Public Read-Only Access for Active Workshops & Curriculum Days
CREATE POLICY "Public can view active workshops"
    ON public.workshops FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Public can view days of active workshops"
    ON public.workshop_days FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workshops w
            WHERE w.id = workshop_days.workshop_id
              AND w.is_active = TRUE
        )
    );
