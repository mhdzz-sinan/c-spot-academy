import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatInr } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await db.getWorkshopBySlug(slug);

  if (!course || !course.is_active) {
    notFound();
  }

  const seatsRemaining = Math.max(0, course.max_seats - course.seats_filled);
  const isEnrolling = course.registration_open && seatsRemaining > 0;

  return (
    <div className="bg-slate-50 pb-20">
      <div className="cad-blueprint-bg border-b border-slate-800 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-amber-400 mb-6 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Programs
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-sky-500/15 px-3 py-1 text-xs font-mono font-semibold text-sky-400 ring-1 ring-sky-500/30">
              ADVANCED ENGINEERING TRACK
            </span>
            <span className="text-xs font-mono text-slate-400">
              {course.mode}
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {course.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base sm:text-lg text-slate-300 leading-relaxed">
            {course.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-400" />
              <span>{course.schedule_summary}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-400" />
              <span>Cohort Capacity: {course.max_seats} Engineers</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-sky-400" />
              <span>Faculty: {course.instructor_name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                Specialization Overview
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {course.description}
              </p>

              <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-500 pt-3">
                Core Industry Modules
              </h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {course.highlights.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Layers className="h-5 w-5 text-sky-600" />
                <h2>Who This Specialization Is Built For</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                This program is tailored for mechanical, automotive, and product design
                graduates, prototyping engineers, and CAD professionals looking to transition
                from basic drafting into full product development lifecycle engineering.
              </p>
              <div className="border-t border-slate-100 pt-4 space-y-2.5 text-sm">
                <div className="flex items-start gap-2 text-slate-700">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>EV Enclosures &amp; Consumer Electronics:</strong> Complex hybrid surfacing, parting line strategy, and injection molding draft analysis.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Sheet Metal Fabrication:</strong> K-Factor calculation, bend deduction tables, stamping clearances, and flat-pattern DXF export.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>ASME Y14.5 GD&amp;T &amp; Tolerance Stack-Up:</strong> Worst-case &amp; RSS statistical tolerance calculations for high-volume manufacturing.</span>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <FileCheck className="h-5 w-5 text-amber-600" />
                  <h3>Prerequisites</h3>
                </div>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  {course.prerequisites.map((req, idx) => (
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
                  <h3>Deliverables</h3>
                </div>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  {course.deliverables.map((del, idx) => (
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
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg space-y-5">
              <span className="inline-block rounded-md bg-slate-900 px-2.5 py-1 text-xs font-mono font-semibold text-sky-400">
                ADVANCED COHORT PASS
              </span>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-slate-900">
                  {formatInr(course.price_inr)}
                </span>
                {course.original_price_inr && (
                  <span className="text-base text-slate-400 line-through">
                    {formatInr(course.original_price_inr)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Inclusive of 6 weeks of mentorship, portfolio reviews, and certification.
              </p>

              <div className="space-y-3 border-y border-slate-100 py-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Schedule</span>
                  <span className="font-medium text-slate-900">Weekend Live</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Community</span>
                  <span className="font-medium text-emerald-700">VIP Telegram Channel</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Admissions</span>
                  <Badge variant={course.registration_open ? 'success' : 'warning'}>
                    {course.registration_open ? 'OPEN' : 'NEXT BATCH SOON'}
                  </Badge>
                </div>
              </div>

              {isEnrolling ? (
                <Link
                  href={`/workshops/${course.slug}/register`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-base font-bold text-slate-950 shadow-sm hover:bg-amber-400 transition-colors"
                >
                  Apply For Next Batch
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-900">
                    Cohort Admissions Opening Soon
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enrollment for this specialization opens after the SolidWorks 3D CAD Bootcamp finishes.
                  </p>
                  <Link
                    href="/workshops/solidworks-cad-bootcamp"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 pt-1"
                  >
                    View Flagship SolidWorks Bootcamp →
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Zero-Risk 100% Satisfaction Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
