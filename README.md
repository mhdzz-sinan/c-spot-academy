# C-Spot Academy

> **Production-grade Next.js platform for industrial engineering workshops, featuring Cashfree Payments, Supabase PostgreSQL, cryptographic token-gated private Telegram cohort onboarding, and an admin command center.**

---

## 🚀 Key Highlights & Architecture

- **Zero-Client-Trust Payments:** Payment status is strictly validated server-to-server with Cashfree PG APIs or signed HMAC-SHA256 webhooks. Frontend redirects never determine paid state.
- **Idempotent Webhook Processing:** Webhook events are deduplicated by transaction ID, amount, and signature before updating database records.
- **Cryptographic Telegram Link Dispensing:** Cohort invite URLs are never exposed in client bundles or public APIs. Dispensed only via `/api/telegram/invite` with a verified JWT containing a per-registration nonce.
- **Dual-Mode Database Layer:** Connects directly to Supabase PostgreSQL when credentials are set, with an automated in-memory sandbox repository pre-seeded with the SolidWorks 3D CAD Bootcamp for offline/local execution.
- **Admin Command Center:** Overview telemetry, student registry with filtering & CSV export, workshop pricing/seat toggle, Telegram invite rotation, and manual transaction overrides.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions, API Routes)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS 3 with custom engineering CAD-blueprint design system
- **Payment Gateway:** Cashfree Payments SDK (`@cashfreepayments/cashfree-js` + REST APIs)
- **Database:** Supabase PostgreSQL with Row Level Security (RLS) & Triggers
- **Cryptography:** `jose` (JWT) + Node.js `crypto` (HMAC-SHA256, timingSafeEqual, randomBytes)
- **Validation:** Zod schemas
- **Testing:** Vitest

---

## 📁 Project Structure

```
c-spot-academy/
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── login/page.tsx       # Secure admin sign-in
│   │   │   │   └── page.tsx             # Telemetry, student table, controls
│   │   ├── (public)/
│   │   │   ├── page.tsx                 # Engineering landing page
│   │   │   ├── workshops/[slug]/
│   │   │   │   ├── page.tsx             # Syllabus & curriculum breakdown
│   │   │   │   └── register/page.tsx    # Registration form
│   │   │   ├── checkout/[orderId]/page.tsx # Cashfree PG checkout
│   │   │   ├── payment/callback/page.tsx   # Gateway callback verifier
│   │   │   ├── registration/success/page.tsx # Telegram unlock CTA
│   │   │   ├── lookup/page.tsx          # OTP-based self-service portal
│   │   │   ├── about/page.tsx           # Methodology & mission
│   │   │   ├── contact/page.tsx         # Engineering support desk
│   │   │   ├── privacy/page.tsx         # Privacy policy
│   │   │   ├── terms/page.tsx           # Terms & conditions
│   │   │   └── refund-policy/page.tsx   # Refund policy
│   │   └── api/
│   │       ├── registrations/route.ts   # Create pending registration
│   │       ├── payments/
│   │       │   ├── create-order/route.ts# Initiate Cashfree order
│   │       │   └── verify/route.ts      # Server-side verification
│   │       ├── webhooks/cashfree/route.ts# Webhook HMAC verification
│   │       ├── telegram/invite/route.ts # Token-gated invite dispenser
│   │       ├── lookup/
│   │       │   ├── request-otp/route.ts # 6-digit OTP request
│   │       │   └── verify-otp/route.ts  # OTP check & token issue
│   │       └── admin/
│   │           ├── stats/route.ts       # Metrics & telemetry
│   │           ├── registrations/route.ts# Access control overrides
│   │           ├── workshops/route.ts   # Workshop settings & pricing
│   │           ├── telegram/route.ts    # Invite URL rotation
│   │           ├── export/route.ts      # CSV student export
│   │           ├── login/route.ts       # Admin auth & session cookie
│   │           └── logout/route.ts      # Admin logout
│   ├── components/
│   │   ├── admin/AdminDashboardClient.tsx
│   │   ├── layout/Header.tsx
│   │   ├── layout/Footer.tsx
│   │   └── workshop/RegistrationForm.tsx
│   ├── lib/
│   │   ├── auth.ts                      # Admin cookie session validation
│   │   ├── cashfree.ts                  # Cashfree client & HMAC verifier
│   │   ├── db.ts                        # Unified database repository
│   │   ├── supabase.ts                  # Supabase client helper
│   │   ├── tokens.ts                    # JWT signing & access tokens
│   │   ├── utils.ts                     # Formatters & code generators
│   │   └── validations.ts               # Zod validation schemas
│   └── types/                           # TypeScript interfaces
├── supabase/
│   ├── migrations/001_initial_schema.sql# PostgreSQL DDL, RLS, Indexes
│   └── seed.sql                         # SolidWorks bootcamp seed data
└── tests/
    ├── cashfree-webhook.test.ts         # Signature verification & idempotency
    ├── registration.test.ts             # Validation & duplicate checks
    └── telegram-access.test.ts          # Access tokens & link rotation
```

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Default values work out of the box with the local mock sandbox for Cashfree & in-memory database).*

### 3. Run Automated Tests
```bash
npm test
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Admin Console Credentials (Local Dev)
- **URL:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Admin Email:** `admin@cspotacademy.in`
- **Passcode:** `cspot_admin_2026_secure` (or whatever `ADMIN_ACCESS_PASSWORD` is set to in `.env.local`)
