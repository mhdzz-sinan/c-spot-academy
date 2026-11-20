'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Compass,
  Download,
  IndianRupee,
  KeyRound,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Send,
  ShieldBan,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type {
  AdminAuditLog,
  AdminDashboardStats,
  PaymentTransaction,
  Registration,
  Workshop,
} from '@/types';
import { formatInr, formatIstDateTime } from '@/lib/utils';

type EnrichedReg = Registration & {
  workshop_title: string;
  has_telegram_access: boolean;
};

interface AdminPayload {
  admin: { email: string; role: string };
  stats: AdminDashboardStats;
  registrations: EnrichedReg[];
  transactions: PaymentTransaction[];
  auditLogs: AdminAuditLog[];
  workshops: Workshop[];
  telegramSettings: {
    inviteUrl: string;
    accessEnabled: boolean;
  };
}

export interface AdminDashboardClientProps {
  initialTab?: 'OVERVIEW' | 'STUDENTS' | 'WORKSHOPS' | 'TELEGRAM' | 'AUDIT';
}

export function AdminDashboardClient({ initialTab = 'OVERVIEW' }: AdminDashboardClientProps) {
  const router = useRouter();
  const [data, setData] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'STUDENTS' | 'WORKSHOPS' | 'TELEGRAM' | 'AUDIT'
  >(initialTab);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const [tgUrl, setTgUrl] = useState('');
  const [tgEnabled, setTgEnabled] = useState(true);
  const [savingTg, setSavingTg] = useState(false);

  const [pendingAction, setPendingAction] = useState<{
    registrationId: string;
    studentName: string;
    action: 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'ROTATE_TOKEN' | 'MARK_PAID_MANUAL';
    label: string;
  } | null>(null);
  const [executingAction, setExecutingAction] = useState(false);

  async function loadAdminData() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setTgUrl(json.data.telegramSettings.inviteUrl);
        setTgEnabled(json.data.telegramSettings.accessEnabled);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  async function handleSaveTelegram(e: React.FormEvent) {
    e.preventDefault();
    setSavingTg(true);
    setBanner(null);

    try {
      const res = await fetch('/api/admin/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteUrl: tgUrl, accessEnabled: tgEnabled }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBanner({ type: 'error', text: json.error || 'Failed to save Telegram settings.' });
      } else {
        setBanner({
          type: 'success',
          text: 'Telegram invite link and access controls updated.',
        });
        await loadAdminData();
      }
    } finally {
      setSavingTg(false);
    }
  }

  async function executeStudentAction() {
    if (!pendingAction) return;
    setExecutingAction(true);
    setBanner(null);

    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: pendingAction.registrationId,
          action: pendingAction.action,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBanner({ type: 'error', text: json.error || 'Action failed.' });
      } else {
        setBanner({
          type: 'success',
          text: `Executed ${pendingAction.label} for ${pendingAction.studentName}.`,
        });
        setPendingAction(null);
        await loadAdminData();
      }
    } finally {
      setExecutingAction(false);
    }
  }

  async function handleToggleWorkshopOpen(workshop: Workshop) {
    setBanner(null);
    const res = await fetch('/api/admin/workshops', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workshopId: workshop.id,
        registration_open: !workshop.registration_open,
      }),
    });
    const json = await res.json();
    if (json.success) {
      setBanner({
        type: 'success',
        text: `Updated registration status for ${workshop.title}.`,
      });
      await loadAdminData();
    }
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-9 w-9 animate-spin text-amber-500" />
      </div>
    );
  }

  const filteredRegistrations = data.registrations.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.registration_code.toLowerCase().includes(q) ||
      r.phone.includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
                <Compass className="h-5 w-5" />
              </div>
              <span className="font-bold tracking-tight">
                C-SPOT <span className="text-amber-400">ADMIN</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-300">
              {data.admin.email}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadAdminData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-slate-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto text-sm">
          {(
            [
              ['OVERVIEW', 'Overview & Metrics'],
              ['STUDENTS', `Students (${data.registrations.length})`],
              ['WORKSHOPS', 'Workshops & Pricing'],
              ['TELEGRAM', 'Telegram Access Security'],
              ['AUDIT', 'Transactions & Audit Logs'],
            ] as const
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={`border-b-2 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === tabKey
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {banner && (
          <div
            className={`rounded-xl border p-4 text-sm font-medium ${
              banner.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-red-200 bg-red-50 text-red-900'
            }`}
          >
            {banner.text}
          </div>
        )}

        {pendingAction && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="text-sm text-amber-950">
              Confirm action: <strong>{pendingAction.label}</strong> for{' '}
              <strong>{pendingAction.studentName}</strong>?
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={executeStudentAction}
                disabled={executingAction}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                {executingAction ? 'Processing...' : 'Confirm Action'}
              </button>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-mono uppercase">Verified Revenue</span>
                  <IndianRupee className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {formatInr(data.stats.totalRevenueInr)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-mono uppercase">Paid Enrollments</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {data.stats.paidRegistrations}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-mono uppercase">Pending Checkout</span>
                  <Users className="h-4 w-4 text-amber-600" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {data.stats.pendingRegistrations}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-mono uppercase">Telegram Unlocked</span>
                  <Send className="h-4 w-4 text-sky-600" />
                </div>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {data.stats.telegramAccessGrantedCount}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Latest Enrollments
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('STUDENTS')}
                  className="text-xs font-semibold text-amber-600 hover:underline"
                >
                  Manage All Students →
                </button>
              </div>
              {data.registrations.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  No registrations recorded yet. Complete a test enrollment on the
                  public site to see live telemetry here.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-xs font-mono uppercase text-slate-500">
                      <tr>
                        <th className="py-3 pr-4">Code</th>
                        <th className="py-3 pr-4">Student</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4">Paid</th>
                        <th className="py-3">Telegram</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.registrations.slice(0, 8).map((r) => (
                        <tr key={r.id}>
                          <td className="py-3 pr-4 font-mono text-xs font-semibold">
                            {r.registration_code}
                          </td>
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-slate-900">{r.full_name}</p>
                            <p className="text-xs text-slate-500">{r.email}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${
                                r.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-mono">
                            {formatInr(r.amount_paid_inr)}
                          </td>
                          <td className="py-3 text-xs font-mono">
                            {r.has_telegram_access ? 'GRANTED' : 'LOCKED'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'STUDENTS' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, phone, code..."
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">PAID</option>
                  <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              <a
                href={`/api/admin/export?status=${encodeURIComponent(statusFilter)}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                <Download className="h-4 w-4 text-amber-400" />
                Export CSV
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-mono uppercase text-slate-500">
                  <tr>
                    <th className="py-3 pr-4">Registration</th>
                    <th className="py-3 pr-4">Participant</th>
                    <th className="py-3 pr-4">Institution</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Telegram</th>
                    <th className="py-3">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3.5 pr-4 font-mono text-xs">
                        <p className="font-bold text-slate-900">{r.registration_code}</p>
                        <p className="text-slate-400">{formatIstDateTime(r.created_at)}</p>
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-slate-900">{r.full_name}</p>
                        <p className="text-xs text-slate-500">
                          {r.email} • {r.phone}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-slate-700">
                        {r.college_or_company}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${
                            r.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-xs font-mono">
                        {r.has_telegram_access ? (
                          <span className="text-emerald-700 font-semibold">GRANTED</span>
                        ) : (
                          <span className="text-slate-400">LOCKED</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {r.status !== 'PAID' && (
                            <button
                              type="button"
                              onClick={() =>
                                setPendingAction({
                                  registrationId: r.id,
                                  studentName: r.full_name,
                                  action: 'MARK_PAID_MANUAL',
                                  label: 'Mark PAID Manually',
                                })
                              }
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                            >
                              Mark Paid
                            </button>
                          )}
                          {r.has_telegram_access ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingAction({
                                    registrationId: r.id,
                                    studentName: r.full_name,
                                    action: 'ROTATE_TOKEN',
                                    label: 'Rotate Access Token',
                                  })
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                <KeyRound className="h-3 w-3" />
                                Rotate
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingAction({
                                    registrationId: r.id,
                                    studentName: r.full_name,
                                    action: 'REVOKE_ACCESS',
                                    label: 'Revoke Telegram Access',
                                  })
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                              >
                                <ShieldBan className="h-3 w-3" />
                                Revoke
                              </button>
                            </>
                          ) : (
                            r.status === 'PAID' && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingAction({
                                    registrationId: r.id,
                                    studentName: r.full_name,
                                    action: 'GRANT_ACCESS',
                                    label: 'Restore Telegram Access',
                                  })
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                              >
                                <ShieldCheck className="h-3 w-3" />
                                Grant Access
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'WORKSHOPS' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {data.workshops.map((w) => (
              <div
                key={w.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-slate-900 px-2.5 py-1 text-xs font-mono text-amber-400">
                    {w.type}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      w.registration_open
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {w.registration_open ? 'REGISTRATIONS OPEN' : 'CLOSED'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{w.title}</h3>
                <p className="text-xs text-slate-500">{w.schedule_summary}</p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                  <div>
                    <span className="text-slate-500">Fee: </span>
                    <strong className="font-mono">{formatInr(w.price_inr)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Seats: </span>
                    <strong className="font-mono">
                      {w.seats_filled}/{w.max_seats}
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleWorkshopOpen(w)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100"
                >
                  {w.registration_open
                    ? 'Pause Public Registrations'
                    : 'Open Public Registrations'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'TELEGRAM' && (
          <form
            onSubmit={handleSaveTelegram}
            className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Protected Telegram Cohort Invite Configuration
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                This invite link is never exposed in public HTML or JS bundles.
                It is dispensed dynamically only to verified PAID students.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Private Telegram Group Invite URL
              </label>
              <input
                type="url"
                required
                value={tgUrl}
                onChange={(e) => setTgUrl(e.target.value)}
                placeholder="https://t.me/+YourPrivateCohortHash"
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 font-mono text-sm"
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={tgEnabled}
                onChange={(e) => setTgEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-amber-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Enable Automatic Telegram Link Dispensing
                </p>
                <p className="text-xs text-slate-500">
                  Unchecking immediately pauses all Telegram invite unlocks across
                  the platform.
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={savingTg}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400"
            >
              {savingTg && <Loader2 className="h-4 w-4 animate-spin" />}
              Save &amp; Rotate Telegram Link
            </button>
          </form>
        )}

        {activeTab === 'AUDIT' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Verified Payment Transactions
              </h2>
              {data.transactions.length === 0 ? (
                <p className="text-sm text-slate-500">No gateway transactions yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.transactions.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs space-y-1"
                    >
                      <div className="flex justify-between font-mono font-bold">
                        <span>{t.cf_payment_id}</span>
                        <span className="text-emerald-700">{formatInr(t.amount)}</span>
                      </div>
                      <p className="text-slate-500">
                        Source: {t.verification_source} •{' '}
                        {formatIstDateTime(t.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Immutable Admin Audit Trail
              </h2>
              {data.auditLogs.length === 0 ? (
                <p className="text-sm text-slate-500">No admin actions logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs space-y-1"
                    >
                      <div className="flex justify-between font-mono font-bold text-slate-900">
                        <span>{log.action}</span>
                        <span className="text-slate-500">
                          {formatIstDateTime(log.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        By {log.admin_identifier} • Target: {log.target_type}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
