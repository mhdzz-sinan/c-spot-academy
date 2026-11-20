-- ============================================================================
-- C-Spot Academy — Initial Seed Data
-- File: supabase/seed.sql
-- ============================================================================

INSERT INTO public.workshops (
    id,
    slug,
    title,
    subtitle,
    type,
    description,
    highlights,
    prerequisites,
    deliverables,
    price_inr,
    original_price_inr,
    currency,
    start_date,
    end_date,
    schedule_summary,
    mode,
    max_seats,
    seats_filled,
    is_active,
    is_featured,
    registration_open,
    instructor_name,
    instructor_bio
) VALUES (
    '11111111-1111-4111-8111-111111111101',
    'solidworks-cad-bootcamp',
    'Industrial SolidWorks 3D CAD & Product Design Bootcamp',
    'Master parametric part modeling, mechanical assemblies, GD&T drafting, and design-for-manufacturing in 3 intensive live sessions.',
    'LIVE_WORKSHOP',
    'A hands-on engineering workshop crafted for mechanical, automotive, aerospace, and product design students and professionals. Move beyond basic tutorials and build production-grade parametric assemblies with industry-standard design intent.',
    '[
        "Live interactive CAD modeling from first principles",
        "Parametric sketching, design tables & failure-proof feature trees",
        "Multi-component mechanical assemblies with mates & motion checks",
        "2D manufacturing drawings with tolerances, BOMs & GD&T callouts",
        "Direct Q&A and portfolio project feedback inside the private Telegram cohort"
    ]'::jsonb,
    '[
        "Windows PC or Laptop (8GB RAM minimum, 16GB recommended)",
        "SolidWorks 2021 or newer installed (setup guide shared in Telegram group)",
        "Basic familiarity with engineering drawing views"
    ]'::jsonb,
    '[
        "3 Live Mentor-Led Engineering Sessions (6+ Hours Total)",
        "Complete SolidWorks Part & Assembly Source Files",
        "Industry CAD Checklist & Design Intent Handbook",
        "Verified C-Spot Academy Certificate of Completion",
        "Private Cohort Telegram Group Access"
    ]'::jsonb,
    499,
    1999,
    'INR',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '9 days',
    'Fri, Sat & Sun • 7:00 PM – 9:15 PM IST',
    'Live Online + Hands-On CAD Labs',
    120,
    34,
    TRUE,
    TRUE,
    TRUE,
    'C-Spot Lead Mechanical Design Engineers',
    'Practicing product design and CAD engineers with 8+ years of experience shipping industrial machinery, EV enclosures, and precision mechanical systems.'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    price_inr = EXCLUDED.price_inr,
    original_price_inr = EXCLUDED.original_price_inr,
    is_active = EXCLUDED.is_active,
    registration_open = EXCLUDED.registration_open;

INSERT INTO public.workshop_days (
    workshop_id,
    day_number,
    title,
    summary,
    session_date,
    duration_minutes,
    topics,
    hands_on_project
) VALUES
(
    '11111111-1111-4111-8111-111111111101',
    1,
    'Parametric Sketching, Design Intent & Core Part Modeling',
    'Build rock-solid sketches and feature trees that never break when dimensions change.',
    'Day 1 • Friday (7:00 PM – 9:15 PM IST)',
    135,
    '[
        "Understanding Design Intent & Parametric Constraints",
        "Fully Defined Sketches, Reference Geometry & Construction Planes",
        "Extrude, Revolve, Sweep, Loft & Shell Workflows",
        "Draft Angles, Fillets & Design for Injection Molding / CNC"
    ]'::jsonb,
    'Precision Cast Gearbox Housing & Mounting Bracket'
),
(
    '11111111-1111-4111-8111-111111111101',
    2,
    'Bottom-Up & Top-Down Assemblies, Mates & Interference Detection',
    'Assemble complex multi-part mechanisms with realistic mechanical constraints and collision checks.',
    'Day 2 • Saturday (7:00 PM – 9:15 PM IST)',
    135,
    '[
        "Sub-Assembly Architecture & Origin Alignment",
        "Standard, Advanced & Mechanical Mates (Gear, Cam, Slot)",
        "Clearance Verification, Hole Alignment & Interference Detection",
        "Exploded Views & Bill of Materials (BOM) Preparation"
    ]'::jsonb,
    'Industrial Belt-Tensioner & Rotary Actuator Assembly'
),
(
    '11111111-1111-4111-8111-111111111101',
    3,
    'Production 2D Drawings, GD&T Essentials & Portfolio Capstone',
    'Translate 3D CAD models into shop-floor-ready manufacturing drawings.',
    'Day 3 • Sunday (7:00 PM – 9:15 PM IST)',
    135,
    '[
        "Orthographic, Section, Detail & Broken-Out Section Views",
        "Datum Selection, Fits, Limits & Core GD&T Feature Control Frames",
        "Automated Ballooning, BOM Tables & Revision Blocks",
        "Portfolio Presentation & Career Roadmap in CAD/Product Design"
    ]'::jsonb,
    'Complete Shop-Floor Manufacturing Drawing Package (PDF + DWG)'
)
ON CONFLICT (workshop_id, day_number) DO UPDATE SET
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    topics = EXCLUDED.topics,
    hands_on_project = EXCLUDED.hands_on_project;

-- 2. System Settings
INSERT INTO public.system_settings (key, value, description, is_secret, updated_by)
VALUES
    (
        'telegram_group_invite_url',
        'https://t.me/cspotofficial',
        'Private Telegram cohort invite link dispensed exclusively to verified PAID registrations.',
        TRUE,
        'system_seed'
    ),
    (
        'telegram_access_enabled',
        'true',
        'Global kill-switch to enable or pause Telegram invite link dispensing.',
        FALSE,
        'system_seed'
    ),
    (
        'support_email',
        'support@cspotacademy.in',
        'Public student support email address.',
        FALSE,
        'system_seed'
    ),
    (
        'support_whatsapp',
        '+91-90000-00000',
        'Student support WhatsApp contact.',
        FALSE,
        'system_seed'
    )
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.admin_users (email, full_name, role, is_active)
VALUES ('admin@cspotacademy.in', 'C-Spot Academy Admin', 'SUPER_ADMIN', TRUE)
ON CONFLICT (email) DO NOTHING;
