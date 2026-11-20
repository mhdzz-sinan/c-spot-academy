import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  FileCode2,
  Laptop,
  Lock,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatInr } from '@/lib/utils';
import { CurriculumAccordion } from '@/components/workshop/CurriculumAccordion';

export const dynamic = 'force-dynamic';

interface WorkshopDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WorkshopDetailPage({
  params,
}: WorkshopDetailPageProps) {
  const { slug } = await params;
  const workshop = await db.getWorkshopBySlug(slug);

  if (!workshop || !workshop.is_active) {
    notFound();
  }

  const seatsRemaining = Math.max(0, workshop.max_seats - workshop.seats_filled);
  const canEnroll = workshop.registration_open && seatsRemaining > 0;

  return (
    <div className="bg-slate-50 pb-20">
      <div className="cad-blueprint-bg border-b border-slate-800 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-amber-500/15 px-3 py-1 text-xs font-mono font-semibold text-amber-400 ring-1 ring-amber-500/30">
              {workshop.type === 'LIVE_WORKSHOP'
                ? 'LIVE HANDS-ON WORKSHOP'
                : 'ADVANCED COHORT TRACK'}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {workshop.mode}
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {workshop.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base sm:text-lg text-slate-300 leading-relaxed">
            {workshop.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>{workshop.schedule_summary}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-400" />
              <span>
                {seatsRemaining} of {workshop.max_seats} seats available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Instructor: {workshop.instructor_name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Program Overview
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {workshop.description}
              </p>

              <h3 className="mt-6 text-sm font-mono font-semibold uppercase tracking-wider text-slate-500">
                Key Engineering Outcomes
              </h3>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {workshop.highlights.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {workshop.days.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Day-by-Day Session Breakdown
                </h2>
                <CurriculumAccordion days={workshop.days} />
              </section>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Laptop className="h-5 w-5 text-amber-600" />
                  <h3>System Prerequisites</h3>
                </div>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  {workshop.prerequisites.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h3>Included Deliverables</h3>
                </div>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  {workshop.deliverables.map((del, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <p className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                COHORT ENROLLMENT PASS
              </p>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-slate-900">
                  {formatInr(workshop.price_inr)}
                </span>
                {workshop.original_price_inr && (
                  <span className="text-base text-slate-400 line-through">
                    {formatInr(workshop.original_price_inr)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Inclusive of all taxes • One-time workshop fee
              </p>

              <div className="mt-6 space-y-3 border-y border-slate-100 py-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Format</span>
                  <span className="font-medium text-slate-900">Live Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cohort Community</span>
                  <span className="font-medium text-emerald-700">
                    Private Telegram Group
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Seat Availability</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {seatsRemaining} left
                  </span>
                </div>
              </div>

              {canEnroll ? (
                <Link
                  href={`/workshops/${workshop.slug}/register`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-base font-bold text-slate-950 shadow-sm hover:bg-amber-400 transition-colors"
                >
                  Register &amp; Pay Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-100 p-4 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    Admissions Opening Soon
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Enrollment for this advanced track is currently closed.
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>256-Bit Encrypted Cashfree Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
