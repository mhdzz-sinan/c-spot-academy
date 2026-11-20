import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatInr } from '@/lib/utils';
import { FaqSection } from '@/components/home/FaqSection';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featuredWorkshop = await db.getWorkshopBySlug('solidworks-cad-bootcamp');
  const advancedCourse = await db.getWorkshopBySlug('advanced-product-design-dfm');

  const seatsRemaining = featuredWorkshop
    ? Math.max(0, featuredWorkshop.max_seats - featuredWorkshop.seats_filled)
    : 86;

  return (
    <div className="flex flex-col">
      <section className="cad-blueprint-bg relative overflow-hidden border-b border-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-mono font-medium text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                LIVE WEEKEND ENGINEERING COHORT • REGISTRATIONS OPEN
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Build Production-Ready{' '}
                <span className="text-amber-400">3D CAD Assemblies</span> With
                Real Design Intent.
              </h1>

              <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
                Stop memorizing disconnected toolbar commands. Master parametric
                SolidWorks modeling, bottom-up &amp; top-down mechanical
                assemblies, interference checks, and shop-floor GD&amp;T
                drawings in 3 intensive mentor-led live sessions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/workshops/solidworks-cad-bootcamp/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
                >
                  Reserve Your Seat ({featuredWorkshop ? formatInr(featuredWorkshop.price_inr) : '₹499'})
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/workshops/solidworks-cad-bootcamp"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-base font-semibold text-white hover:bg-slate-800 transition-all"
                >
                  Explore 3-Day Syllabus
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-800/90 pt-6 max-w-xl">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-white font-mono">
                    6.5+ Hrs
                  </p>
                  <p className="text-xs text-slate-400">Live Hands-On CAD Labs</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
                    {seatsRemaining} Seats
                  </p>
                  <p className="text-xs text-slate-400">Remaining in Batch</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
                    Instant
                  </p>
                  <p className="text-xs text-slate-400">Private Telegram Access</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="rounded-md bg-sky-500/10 px-2.5 py-1 text-xs font-mono font-semibold text-sky-400 ring-1 ring-sky-500/20">
                    FLAGSHIP BOOTCAMP
                  </span>
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Certificate
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-bold text-white">
                  {featuredWorkshop?.title ||
                    'Industrial SolidWorks 3D CAD & Product Design Bootcamp'}
                </h2>

                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>
                      {featuredWorkshop?.schedule_summary ||
                        'Fri, Sat & Sun • 7:00 PM – 9:15 PM IST'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Live Interactive + Step-by-Step CAD Files Included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>
                      {featuredWorkshop?.seats_filled ?? 34} /{' '}
                      {featuredWorkshop?.max_seats ?? 120} Engineers Enrolled
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/80 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Cohort Enrollment Fee
                    </p>
                    <div className="mt-1 flex items-baseline gap-2.5">
                      <span className="text-3xl font-extrabold text-white">
                        {featuredWorkshop
                          ? formatInr(featuredWorkshop.price_inr)
                          : '₹499'}
                      </span>
                      {featuredWorkshop?.original_price_inr && (
                        <span className="text-sm text-slate-500 line-through">
                          {formatInr(featuredWorkshop.original_price_inr)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                    75% OFF
                  </span>
                </div>

                <Link
                  href="/workshops/solidworks-cad-bootcamp/register"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  Proceed to Registration &amp; Payment
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p className="mt-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  Instant Private Telegram Group Unlock Upon Payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-amber-600">
            WHY C-SPOT ACADEMY
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Engineered Like a Real Hardware Design Review
          </h2>
          <p className="mt-3 text-slate-600">
            Every session focuses on how CAD models behave downstream—in tooling,
            tolerance stack-ups, assembly lines, and vendor RFQs.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Failure-Proof Design Intent
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Learn parent-child feature hierarchy, reference plane discipline,
              and parametric relations so late-stage ECOs never shatter your
              tree.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Multi-Part Mechanical Assemblies
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Build industrial actuator and gearbox assemblies with mechanical
              mates, hole-alignment checks, and dynamic interference detection.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Shop-Floor GD&amp;T &amp; BOMs
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Convert 3D geometry into unambiguous 2D production prints with
              datum frames, fits, section views, and automated Bills of
              Materials.
            </p>
          </div>
        </div>
      </section>

      {featuredWorkshop && featuredWorkshop.days.length > 0 && (
        <section className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-amber-600">
                  STRUCTURED SYLLABUS
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  3-Day Live Bootcamp Curriculum
                </h2>
              </div>
              <Link
                href="/workshops/solidworks-cad-bootcamp"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700"
              >
                View Full Curriculum &amp; Deliverables
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {featuredWorkshop.days.map((day) => (
                <div
                  key={day.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-6"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-mono font-bold text-amber-400">
                        DAY 0{day.day_number}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {day.duration_minutes} mins
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      {day.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{day.summary}</p>
                    <ul className="mt-4 space-y-2">
                      {day.topics.map((topic, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-slate-700"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {day.hands_on_project && (
                    <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3">
                      <p className="text-[11px] font-mono font-semibold uppercase text-amber-800">
                        Hands-On Lab Build
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-900">
                        {day.hands_on_project}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {advancedCourse && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-block rounded-full bg-sky-500/15 px-3 py-1 text-xs font-mono font-semibold text-sky-400">
                NEXT STEP SPECIALIZATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold">
                {advancedCourse.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                {advancedCourse.subtitle}
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href={`/courses/${advancedCourse.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Explore Advanced Track
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <FaqSection />
    </div>
  );
}
