import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { RegistrationForm } from '@/components/workshop/RegistrationForm';

export const dynamic = 'force-dynamic';

interface RegisterPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WorkshopRegisterPage({
  params,
}: RegisterPageProps) {
  const { slug } = await params;
  const workshop = await db.getWorkshopBySlug(slug);

  if (!workshop || !workshop.is_active) {
    notFound();
  }

  if (!workshop.registration_open) {
    redirect(`/workshops/${workshop.slug}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/workshops/${workshop.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workshop Details
      </Link>

      <div className="mt-4 mb-8">
        <p className="text-xs font-mono font-semibold uppercase tracking-widest text-amber-600">
          STEP 1 OF 2 • COHORT ENROLLMENT
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
          Register for {workshop.title}
        </h1>
      </div>

      <RegistrationForm
        workshopSlug={workshop.slug}
        workshopTitle={workshop.title}
        priceInr={workshop.price_inr}
        scheduleSummary={workshop.schedule_summary}
      />
    </div>
  );
}
