'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Terminal,
  XCircle,
} from 'lucide-react';
import { formatInr } from '@/lib/utils';

interface StoredOrderMeta {
  orderId: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
  environment: 'sandbox' | 'production';
  workshopTitle: string;
  studentName: string;
  studentEmail: string;
  registrationCode: string;
}

export default function CheckoutPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = decodeURIComponent(params.orderId);

  const [orderMeta, setOrderMeta] = useState<StoredOrderMeta | null>(null);
  const [launchingSdk, setLaunchingSdk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem(`cspot_order_${orderId}`);
      if (raw) {
        try {
          setOrderMeta(JSON.parse(raw));
        } catch {
          // Ignore malformed storage
        }
      }
    }
  }, [orderId]);

  const isSimulatedSession =
    !orderMeta?.paymentSessionId ||
    orderMeta.paymentSessionId.startsWith('session_sim_');

  async function launchCashfreeCheckout() {
    if (!orderMeta) return;
    setLaunchingSdk(true);
    setError(null);

    try {
      const { load } = await import('@cashfreepayments/cashfree-js');
      const cashfree = await load({
        mode: orderMeta.environment === 'production' ? 'production' : 'sandbox',
      });

      if (!cashfree) {
        throw new Error('Cashfree Checkout SDK failed to initialize.');
      }

      await cashfree.checkout({
        paymentSessionId: orderMeta.paymentSessionId,
        redirectTarget: '_self',
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load Cashfree Checkout SDK.'
      );
      setLaunchingSdk(false);
    }
  }

  function handleSimulatedSuccess() {
    router.push(`/payment/callback?order_id=${encodeURIComponent(orderId)}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600">
              STEP 2 OF 2 • SECURE PAYMENT
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
              Complete Workshop Enrollment
            </h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Lock className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Merchant Order ID</span>
            <span className="font-mono font-semibold text-slate-900">{orderId}</span>
          </div>
          {orderMeta && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration Code</span>
                <span className="font-mono font-semibold text-slate-900">
                  {orderMeta.registrationCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Participant</span>
                <span className="font-medium text-slate-900">
                  {orderMeta.studentName} ({orderMeta.studentEmail})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Program</span>
                <span className="font-medium text-slate-900 text-right max-w-[60%]">
                  {orderMeta.workshopTitle}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-baseline">
                <span className="font-semibold text-slate-700">Amount Due</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatInr(orderMeta.amount)}
                </span>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {!isSimulatedSession ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={launchCashfreeCheckout}
              disabled={launchingSdk}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-base font-bold text-white hover:bg-slate-800 disabled:opacity-60 transition-all"
            >
              {launchingSdk ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Launching Cashfree Gateway...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 text-amber-400" />
                  Pay Securely with Cashfree
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-5 space-y-4">
            <div className="flex items-start gap-2.5">
              <Terminal className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-amber-950">
                  Cashfree Sandbox Local Simulator Active
                </h2>
                <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                  Merchant credentials are currently set to placeholder values in{' '}
                  <code className="font-mono">.env</code>. Use the controls below
                  to simulate Cashfree&apos;s gateway return flow and trigger
                  server-side verification + Telegram unlock.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleSimulatedSuccess}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Simulate Payment Success
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push('/workshops/solidworks-cad-bootcamp/register')
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <XCircle className="h-4 w-4 text-red-500" />
                Cancel &amp; Return
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>
            Payment status is independently verified server-to-server with
            Cashfree before unlocking cohort access.
          </span>
        </div>
      </div>
    </div>
  );
}
