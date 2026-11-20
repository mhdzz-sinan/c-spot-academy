import React from 'react';
import { Clock, Mail, MessageSquare, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 space-y-8">
      <div>
        <p className="text-xs font-mono font-semibold uppercase tracking-widest text-amber-600">
          STUDENT SUPPORT
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
          Contact C-Spot Academy
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Need assistance with SolidWorks software setup, payment reconciliation,
          or Telegram cohort access? Reach out to our engineering support desk.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
          <Mail className="h-6 w-6 text-amber-600" />
          <h2 className="font-bold text-slate-900">Email Support</h2>
          <p className="text-sm text-slate-600">support@cspotacademy.in</p>
          <p className="text-xs text-slate-400">
            Include your Registration ID (e.g., CSA-2026-XXXXXX) for faster
            resolution.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
          <Clock className="h-6 w-6 text-sky-600" />
          <h2 className="font-bold text-slate-900">Support Hours</h2>
          <p className="text-sm text-slate-600">Mon – Sun • 10:00 AM – 8:00 PM IST</p>
          <p className="text-xs text-slate-400">
            Priority live support during active weekend workshop sessions.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex items-start gap-3 text-sm text-slate-700">
        <MessageSquare className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-900 flex items-center gap-1.5">
            Already Paid &amp; Looking for Your Telegram Link?
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </p>
          <p className="mt-1 text-slate-600">
            Use the self-service <strong>Registration Lookup</strong> page in the
            navigation bar to verify your email with an OTP and unlock your
            cohort Telegram invite immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
