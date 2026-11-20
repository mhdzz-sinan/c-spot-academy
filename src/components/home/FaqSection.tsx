'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'What version of SolidWorks do I need for this workshop?',
    answer:
      'Any version from SolidWorks 2021 through SolidWorks 2026 will work seamlessly. We also provide step-by-step installation instructions, system configuration guidance, and license setup notes inside the private student Telegram group prior to Day 1.',
  },
  {
    question: 'How do I get access to the private Telegram cohort group?',
    answer:
      'Immediately after completing your payment via Cashfree, you are redirected to the confirmation screen where your cryptographic access token unlocks the "JOIN TELEGRAM GROUP" button. If you accidentally close the tab, you can retrieve your access anytime on our Registration Lookup page using your registered email and a 6-digit OTP.',
  },
  {
    question: 'Will session recordings and CAD exercise files be available?',
    answer:
      'Yes. All live mentor-led sessions are recorded in high-definition 1080p. All parametric part files (.SLDPRT), mechanical assembly models (.SLDASM), 2D drawing templates (.SLDDRW), and GD&T specification checklists are shared directly in the cohort Telegram group.',
  },
  {
    question: 'Is a verified certificate issued upon completion?',
    answer:
      'Yes. Every student who submits their Day 3 gearbox and actuator assembly prints receives a verifiable C-Spot Academy Certificate of Industrial CAD Competency with a unique cryptographic verification identifier.',
  },
  {
    question: 'What if I am a beginner with no prior CAD modeling experience?',
    answer:
      'The curriculum is structured to take you from first-principles sketching (origin placement, geometric relations, fully defined sketches) through intermediate 3D features and multi-body assemblies. Mentors debug student models live in the workshop.',
  },
  {
    question: 'What is the refund and cancellation policy?',
    answer:
      'We offer a 100% money-back guarantee up to 48 hours before Day 1 starts. Simply email support@cspotacademy.in with your Registration ID, and your fee is refunded to the original payment method.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(idx: number) {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-mono font-semibold text-amber-700">
          <HelpCircle className="h-3.5 w-3.5" />
          FREQUENTLY ASKED QUESTIONS
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Everything You Need to Know
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Common questions regarding hardware prerequisites, software licenses,
          session recordings, and Telegram access.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white transition-all shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between p-5 sm:p-6 text-left"
              >
                <span className="text-base font-semibold text-slate-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-slate-400 transition-transform duration-200 shrink-0 ml-4',
                    isOpen && 'rotate-180 text-amber-600'
                  )}
                />
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-5 pb-5 sm:px-6 sm:pb-6 pt-3 text-sm leading-relaxed text-slate-600">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
