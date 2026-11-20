import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 space-y-6 text-sm leading-relaxed text-slate-700">
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p className="text-xs font-mono text-slate-500">Last Updated: 2026</p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
        <p>
          C-Spot Academy collects participant details strictly necessary to
          administer live engineering workshops, verify payments, issue
          completion certificates, and grant access to private cohort channels.
          This includes your full name, email address, phone number, academic or
          corporate affiliation, and transaction identifiers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">2. Payment Security</h2>
        <p>
          All online payments are processed securely through Cashfree Payments.
          C-Spot Academy never collects or stores raw credit/debit card numbers,
          CVVs, or UPI PINs on our servers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900">3. Data Protection &amp; Sharing</h2>
        <p>
          We never sell, rent, or trade student personal information to third
          parties. Access to enrollment records is restricted to authorized
          C-Spot Academy administrators for cohort operations and support.
        </p>
      </section>
    </div>
  );
}
