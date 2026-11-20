'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Lock,
  RefreshCw,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { formatInr } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    status: string;
    orderStatus: string;
    registrationCode: string;
    workshopTitle: string;
    studentName: string;
    studentEmail: string;
    accessToken?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [unlocking, setUnlocking] = useState(false);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [telegramError, setTelegramError] = useState<string | null>(null);

  async function checkStatus() {
    if (!orderId) {
      setError('Please provide a valid order_id parameter.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to verify payment status.');
      } else {
        setData(json.data);
      }
    } catch {
      setError('Network communication error while checking payment status.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function handleUnlockTelegram() {
    if (!data?.accessToken) {
      setTelegramError('Access token is missing. Please retrieve it via Registration Lookup.');
      return;
    }

    setUnlocking(true);
    setTelegramError(null);

    try {
      const res = await fetch('/api/telegram/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: data.accessToken }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setTelegramError(json.error || 'Unable to dispense invite link.');
      } else {
        setTelegramUrl(json.data.inviteUrl);
      }
    } catch {
      setTelegramError('Network error unlocking Telegram invite.');
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600">
              AUDIT VERIFIER
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Payment Status Check
            </h1>
          </div>
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-amber-500" />
            <p className="text-sm text-slate-600">
              Querying Cashfree server-to-server gateway status...
            </p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Verification Problem</p>
                <p className="mt-0.5 text-xs text-red-700">{error}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={checkStatus} variant="secondary" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Verification
              </Button>
              <Link href="/lookup" className="flex-1">
                <Button variant="outline" className="w-full">
                  Registration Lookup
                </Button>
              </Link>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  data.status === 'PAID'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {data.status === 'PAID' ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>
              <div>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${
                    data.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {data.status}
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {data.workshopTitle}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID</span>
                <span className="font-mono font-semibold text-slate-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration Code</span>
                <span className="font-mono font-semibold text-slate-900">
                  {data.registrationCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student</span>
                <span className="font-medium text-slate-900">
                  {data.studentName} ({data.studentEmail})
                </span>
              </div>
            </div>

            {data.status === 'PAID' && (
              <div className="rounded-2xl bg-slate-900 p-6 text-white space-y-4">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Send className="h-4 w-4 text-amber-400" />
                    Private Cohort Telegram Group
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Your single-user cryptographic token is valid and active.
                  </p>
                </div>

                {telegramError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                    {telegramError}
                  </div>
                )}

                {!telegramUrl ? (
                  <Button
                    onClick={handleUnlockTelegram}
                    isLoading={unlocking}
                    variant="amber"
                    className="w-full"
                  >
                    Reveal Telegram Invite Link
                  </Button>
                ) : (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
                  >
                    Open Private Telegram Group
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
