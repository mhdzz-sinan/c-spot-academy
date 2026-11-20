import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 space-y-6 text-sm leading-relaxed text-slate-700">
      <h1 className="text-3xl font-extrabold text-slate-900">
        Refund &amp; Cancellation Policy
      </h1>
      <p className="text-xs font-mono text-slate-500">Last Updated: 2026</p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">
          1. Pre-Cohort Cancellation Window
        </h2>
        <p>
          Participants may request a full refund up to 48 hours prior to Day 1 of
          the scheduled live workshop by emailing{' '}
          <span className="font-semibold">support@cspotacademy.in</span> with
          their Registration ID.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">
          2. Post-Commencement &amp; Digital Material Access
        </h2>
        <p>
          Once the workshop cohort has commenced or proprietary CAD source files
          have been distributed, fees are non-refundable. However, participants
          experiencing emergencies may request a one-time transfer to the next
          scheduled cohort batch.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">3. Duplicate Payments</h2>
        <p>
          In the event of an accidental duplicate payment for the same
          registration, 100% of the duplicate transaction amount is refunded to
          the original payment method within 5–7 business days.
        </p>
      </section>
    </div>
  );
}
