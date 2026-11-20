'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState<'VERIFYING' | 'PAID' | 'PENDING' | 'FAILED'>(
    'VERIFYING'
  );
  const [message, setMessage] = useState(
    'Confirming transaction directly with Cashfree Payment Gateway...'
  );

  async function verifyOrderOnServer() {
    if (!orderId) {
      setStatus('FAILED');
      setMessage('Missing order_id in payment callback URL.');
      return;
    }

    setStatus('VERIFYING');
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setStatus('FAILED');
        setMessage(json.error || 'Unable to verify payment status.');
        return;
      }

      const data = json.data;

      if (data.status === 'PAID' && data.accessToken) {
        setStatus('PAID');
        setMessage('Payment confirmed! Unlocking your cohort access...');

        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'cspot_latest_confirmed',
            JSON.stringify({
              accessToken: data.accessToken,
              registrationCode: data.registrationCode,
              workshopTitle: data.workshopTitle,
              studentName: data.studentName,
              studentEmail: data.studentEmail,
            })
          );
        }

        setTimeout(() => {
          router.replace(
            `/registration/success?code=${encodeURIComponent(data.registrationCode)}`
          );
        }, 700);
        return;
      }

      if (data.status === 'FAILED') {
        setStatus('FAILED');
        setMessage('Your payment was declined or expired at the gateway.');
        return;
      }

      setStatus('PENDING');
      setMessage(
        'Your payment is still processing at the bank. Click Re-Verify in a few seconds.'
      );
    } catch {
      setStatus('FAILED');
      setMessage('Network error while verifying payment. Please retry.');
    }
  }

  useEffect(() => {
    verifyOrderOnServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg space-y-5">
        {status === 'VERIFYING' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900">
              Verifying Payment With Gateway
            </h1>
            <p className="text-sm text-slate-600">{message}</p>
          </>
        )}

        {status === 'PAID' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Enrollment Confirmed!
            </h1>
            <p className="text-sm text-slate-600">{message}</p>
          </>
        )}

        {(status === 'PENDING' || status === 'FAILED') && (
          <>
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">
              {status === 'PENDING'
                ? 'Payment Awaiting Confirmation'
                : 'Payment Not Completed'}
            </h1>
            <p className="text-sm text-slate-600">{message}</p>

            <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={verifyOrderOnServer}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
                Re-Verify Status
              </button>
              <Link
                href="/workshops/solidworks-cad-bootcamp/register"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Try Again
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-amber-500" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
