'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { formatInr } from '@/lib/utils';

interface RegistrationFormProps {
  workshopSlug: string;
  workshopTitle: string;
  priceInr: number;
  scheduleSummary: string;
}

export function RegistrationForm({
  workshopSlug,
  workshopTitle,
  priceInr,
  scheduleSummary,
}: RegistrationFormProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeOrCompany, setCollegeOrCompany] = useState('');
  const [departmentOrRole, setDepartmentOrRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('STUDENT_3_4_YEAR');
  const [city, setCity] = useState('');
  const [referralSource, setReferralSource] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setAlreadyPaid(false);

    try {
      const regRes = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopSlug,
          fullName,
          email,
          phone,
          collegeOrCompany,
          departmentOrRole,
          experienceLevel,
          city,
          referralSource,
        }),
      });

      const regJson = await regRes.json();

      if (!regRes.ok || !regJson.success) {
        if (regJson.code === 'ALREADY_REGISTERED') {
          setAlreadyPaid(true);
        }
        setErrorMessage(
          regJson.error || 'Please check your registration details and try again.'
        );
        setSubmitting(false);
        return;
      }

      const registrationId = regJson.data.registration.id;

      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });

      const orderJson = await orderRes.json();

      if (!orderRes.ok || !orderJson.success) {
        setErrorMessage(
          orderJson.error || 'Unable to initiate payment session. Please retry.'
        );
        setSubmitting(false);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          `cspot_order_${orderJson.data.orderId}`,
          JSON.stringify({
            orderId: orderJson.data.orderId,
            paymentSessionId: orderJson.data.paymentSessionId,
            amount: orderJson.data.amount,
            currency: orderJson.data.currency,
            environment: orderJson.data.environment,
            workshopTitle,
            studentName: fullName,
            studentEmail: email,
            registrationCode: regJson.data.registration.registration_code,
          })
        );
      }

      router.push(`/checkout/${encodeURIComponent(orderJson.data.orderId)}`);
    } catch {
      setErrorMessage('Network error while submitting registration. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm lg:col-span-8"
      >
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Participant Details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your certificate and private Telegram cohort invite will be bound to
            these verified credentials.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            {alreadyPaid && (
              <div className="pl-7">
                <Link
                  href="/lookup"
                  className="inline-flex items-center gap-1 font-semibold text-red-900 underline"
                >
                  Go to Registration Lookup to unlock your Telegram group →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-800">
              Full Name (For Certificate) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Arjun Sharma"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arjun@example.com"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Mobile Number (WhatsApp / India) <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">
              College / University / Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={collegeOrCompany}
              onChange={(e) => setCollegeOrCompany(e.target.value)}
              placeholder="e.g., VIT Vellore / Tata Technologies"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Department / Engineering Role
            </label>
            <input
              type="text"
              value={departmentOrRole}
              onChange={(e) => setDepartmentOrRole(e.target.value)}
              placeholder="e.g., Mechanical Engineering / CAD Trainee"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Current Profile <span className="text-red-500">*</span>
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="STUDENT_1_2_YEAR">Engineering Student (1st / 2nd Year)</option>
              <option value="STUDENT_3_4_YEAR">Engineering Student (3rd / Final Year)</option>
              <option value="RECENT_GRADUATE">Recent Graduate / Job Seeker</option>
              <option value="WORKING_PROFESSIONAL">Working Engineer / Professional</option>
              <option value="BEGINNER">Complete Beginner to 3D CAD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Pune, Bengaluru, Chennai"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-4 text-base font-bold text-slate-950 shadow-md hover:bg-amber-400 disabled:opacity-60 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Secure Payment Order...
              </>
            ) : (
              <>
                Continue to Payment ({formatInr(priceInr)})
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="lg:col-span-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <span className="inline-block rounded-md bg-slate-900 px-2.5 py-1 text-xs font-mono font-semibold text-amber-400">
            ORDER SUMMARY
          </span>

          <div>
            <h3 className="text-lg font-bold text-slate-900">{workshopTitle}</h3>
            <p className="mt-1 text-xs text-slate-500">{scheduleSummary}</p>
          </div>

          <div className="space-y-2.5 border-y border-slate-100 py-4 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>3 Live Mentor-Led CAD Sessions</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>SolidWorks Part &amp; Assembly Source Files</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Private Cohort Telegram Group Access</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Verified C-Spot Academy Certificate</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Total Payable</span>
            <span className="text-2xl font-extrabold text-slate-900">
              {formatInr(priceInr)}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Server-Verified Enrollment
            </p>
            <p>
              Immediately after payment confirmation, your unique Telegram
              cohort invite button unlocks automatically.
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <Lock className="h-3.5 w-3.5" />
            UPI, Cards, NetBanking via Cashfree
          </p>
        </div>
      </div>
    </div>
  );
}
