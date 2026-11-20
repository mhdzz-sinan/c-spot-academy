import React from 'react';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 space-y-6 text-sm leading-relaxed text-slate-700">
      <h1 className="text-3xl font-extrabold text-slate-900">
        Terms &amp; Conditions
      </h1>
      <p className="text-xs font-mono text-slate-500">Last Updated: 2026</p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">1. Workshop Enrollment</h2>
        <p>
          Enrollment is confirmed strictly upon successful payment verification
          via Cashfree Payment Gateway. Each registration grants single-user
          access to the scheduled live sessions, source files, and private
          cohort Telegram group.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">
          2. Private Telegram Cohort Conduct
        </h2>
        <p>
          Sharing private Telegram invite links with non-enrolled individuals or
          posting spam/unauthorized promotions inside the cohort group will
          result in immediate access revocation without refund.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">3. Intellectual Property</h2>
        <p>
          All CAD models, assembly exercises, handbooks, and session recordings
          provided by C-Spot Academy are licensed for personal educational and
          portfolio use only.
        </p>
      </section>
    </div>
  );
}
