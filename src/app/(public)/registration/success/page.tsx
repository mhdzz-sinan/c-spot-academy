'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Lock,
  Send,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface ConfirmedSession {
  accessToken: string;
  registrationCode: string;
  workshopTitle: string;
  studentName: string;
  studentEmail: string;
}

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const codeFromQuery = searchParams.get('code');

  const [session, setSession] = useState<ConfirmedSession | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('cspot_latest_confirmed');
      if (raw) {
        try {
          setSession(JSON.parse(raw));
        } catch {
          // Ignore malformed sessionStorage
        }
      }
    }
  }, []);

  async function handleUnlockTelegram() {
    if (!session?.accessToken) {
      setError(
        'Access token not found in current browser session. Please verify via Registration Lookup.'
      );
      return;
    }

    setUnlocking(true);
    setError(null);

    try {
      const res = await fetch('/api/telegram/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: session.accessToken }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Unable to unlock Telegram invite link.');
        setUnlocking(false);
        return;
      }

      setTelegramUrl(json.data.inviteUrl);
      setUnlocking(false);
    } catch {
      setError('Network error while requesting Telegram invite link.');
      setUnlocking(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-700">
            PAYMENT VERIFIED • ENROLLMENT CONFIRMED
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome to C-Spot Academy
            {session?.studentName ? `, ${session.studentName}` : ''}!
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your seat is officially locked in. Save your registration code below
            for attendance, CAD source files, and certification.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Registration ID</span>
            <span className="font-mono font-bold text-slate-900">
              {session?.registrationCode || codeFromQuery || 'CONFIRMED'}
            </span>
          </div>
          {session?.workshopTitle && (
            <div className="flex justify-between">
              <span className="text-slate-500">Program</span>
              <span className="font-semibold text-slate-900 text-right max-w-[65%]">
                {session.workshopTitle}
              </span>
            </div>
          )}
          {session?.studentEmail && (
            <div className="flex justify-between">
              <span className="text-slate-500">Registered Email</span>
              <span className="font-medium text-slate-800">
                {session.studentEmail}
              </span>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-slate-900 p-6 sm:p-7 text-white space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            MANDATORY NEXT STEP • COHORT ONBOARDING
          </div>
          <h2 className="text-xl font-bold">
            Join the Private Cohort Telegram Group
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            All live Zoom/Meet links, SolidWorks installation guides, starter
            part files, and mentor Q&amp;A are distributed inside our private
            enrolled-students Telegram channel.
          </p>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/60 p-3.5 text-xs text-red-200 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p>{error}</p>
                <Link
                  href="/lookup"
                  className="mt-1 inline-block font-semibold text-amber-400 underline"
                >
                  Recover access via Registration Lookup →
                </Link>
              </div>
            </div>
          )}

          {!telegramUrl ? (
            <button
              type="button"
              onClick={handleUnlockTelegram}
              disabled={unlocking}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-6 py-4 text-base font-bold text-slate-950 shadow-lg hover:bg-amber-400 disabled:opacity-60 transition-all"
            >
              {unlocking ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying Access Token...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  UNLOCK &amp; JOIN TELEGRAM GROUP
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4">
              <p className="text-xs font-mono text-emerald-300">
                ✓ TOKEN VERIFIED • PRIVATE INVITE LINK UNLOCKED
              </p>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                Open Private Telegram Cohort
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            Protected by cryptographic single-student token authentication.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-amber-500" />
        </div>
      }
    >
      <RegistrationSuccessContent />
    </Suspense>
  );
}
