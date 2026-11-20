import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-amber-400 ring-1 ring-slate-800">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-base font-bold tracking-tight">
                C-SPOT <span className="text-amber-400">ACADEMY</span>
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              Practical mechanical design, parametric 3D CAD modeling, GD&amp;T,
              and Design-for-Manufacturing cohorts engineered by industry
              practitioners.
            </p>
            <p className="text-xs font-mono text-slate-500">
              Payments secured by Cashfree Payments • Instant Token-Gated Cohort Onboarding
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Programs &amp; Access
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/workshops/solidworks-cad-bootcamp"
                  className="hover:text-amber-400 transition-colors"
                >
                  SolidWorks 3D CAD Bootcamp
                </Link>
              </li>
              <li>
                <Link
                  href="/lookup"
                  className="hover:text-amber-400 transition-colors"
                >
                  Registration &amp; Telegram Lookup
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-amber-400 transition-colors"
                >
                  About C-Spot Academy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Policies &amp; Support
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact &amp; Student Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="hover:text-amber-400 transition-colors"
                >
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} C-Spot Academy. All rights reserved.</p>
          <p className="font-mono">ISO/ASME Design Intent Driven Engineering Education</p>
        </div>
      </div>
    </footer>
  );
}
