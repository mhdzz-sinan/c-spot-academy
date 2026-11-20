'use client';

import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, Clock, FileCode2, Wrench } from 'lucide-react';
import type { WorkshopDay } from '@/types';
import { cn } from '@/lib/utils';

export interface CurriculumAccordionProps {
  days: WorkshopDay[];
}

export function CurriculumAccordion({ days }: CurriculumAccordionProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const isExpanded = expandedDay === day.day_number;
        return (
          <div
            key={day.id}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedDay((prev) => (prev === day.day_number ? null : day.day_number))
              }
              className="flex w-full items-center justify-between p-6 text-left hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-mono font-bold text-amber-400 shrink-0 w-fit">
                  DAY 0{day.day_number}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {day.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{day.session_date || `${day.duration_minutes} Minutes Live Lab`}</span>
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-slate-400 transition-transform duration-200 shrink-0 ml-4',
                  isExpanded && 'rotate-180 text-amber-600'
                )}
              />
            </button>

            {isExpanded && (
              <div className="border-t border-slate-100 p-6 pt-4 bg-slate-50/40 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">{day.summary}</p>

                <div>
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Topics &amp; Hands-On Demonstrations
                  </h4>
                  <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {day.topics.map((topic, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs"
                      >
                        <FileCode2 className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {day.hands_on_project && (
                  <div className="rounded-xl border border-amber-200/90 bg-amber-50/80 p-4 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500 text-slate-950 shrink-0 mt-0.5">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                        Day 0{day.day_number} Capstone Build
                      </p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        {day.hands_on_project}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Modeled live step-by-step with instructor guidance and instant Q&amp;A troubleshooting.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
