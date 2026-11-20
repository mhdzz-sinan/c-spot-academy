'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { formatInr } from '@/lib/utils';

interface LookedUpRegistration {
  id: string;
  registrationCode: string;
  workshopTitle: string;
  scheduleSummary: string;
  studentName: string;
  status: string;
  amountPaidInr: number;
  accessToken?: string;
}

export default function RegistrationLookupPage() {
  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'RESULTS'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sandboxOtpHint, setSandboxOtpHint] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<LookedUpRegistration[]>([]);
  const [telegramLinks, setTelegramLinks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/lookup/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Unable to send OTP.');
        setLoading(false);
        return;
      }

      if (json.data.sandboxOtp) {
        setSandboxOtpHint(json.data.sandboxOtp);
      }
      setStep('OTP');
    } catch {
      setError('Network error while sending OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/lookup/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Invalid OTP.');
        setLoading(false);
        return;
      }

      setRegistrations(json.data.registrations || []);
      setStep('RESULTS');
    } catch {
      setError('Network error while verifying OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRevealTelegram(reg: LookedUpRegistration) {
    if (!reg.accessToken) return;
    setUnlockingId(reg.id);
    setError(null);

    try {
      const res = await fetch('/api/telegram/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: reg.accessToken }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Unable to unlock Telegram link.');
      } else {
        setTelegramLinks((prev) => ({
          ...prev,
          [reg.id]: json.data.inviteUrl,
        }));
      }
    } catch {
      setError('Network error while unlocking Telegram link.');
    } finally {
      setUnlockingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md space-y-6">
        <div className="space-y-1.5">
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-amber-600">
            SELF-SERVICE PORTAL
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Registration Status &amp; Telegram Access Lookup
          </h1>
          <p className="text-sm text-slate-600">
            Verify your registered email with a 6-digit one-time passcode to
            view your enrollment receipt and re-access your private Telegram
            cohort link.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
            {error}
          </div>
        )}

        {step === 'EMAIL' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Registered Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-amber-400" />
              )}
              Send 6-Digit Verification OTP
            </button>
          </form>
        )}

        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {sandboxOtpHint && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
                <span className="font-bold">Sandbox Preview OTP:</span>{' '}
                <code className="font-mono text-sm font-bold">{sandboxOtpHint}</code>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Enter 6-Digit OTP sent to {email}
              </label>
              <div className="relative mt-1.5">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 font-mono text-base tracking-widest focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify &amp; View Enrollments
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('EMAIL');
                  setOtp('');
                  setSandboxOtpHint(null);
                }}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        {step === 'RESULTS' && (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {reg.registrationCode}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${
                      reg.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {reg.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {reg.workshopTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Participant: {reg.studentName} • Paid:{' '}
                    {formatInr(reg.amountPaidInr)}
                  </p>
                </div>

                {reg.status === 'PAID' && reg.accessToken && (
                  <div>
                    {!telegramLinks[reg.id] ? (
                      <button
                        type="button"
                        onClick={() => handleRevealTelegram(reg)}
                        disabled={unlockingId === reg.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        {unlockingId === reg.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5 text-amber-400" />
                        )}
                        Unlock Private Telegram Cohort Link
                      </button>
                    ) : (
                      <a
                        href={telegramLinks[reg.id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Join Telegram Cohort
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
