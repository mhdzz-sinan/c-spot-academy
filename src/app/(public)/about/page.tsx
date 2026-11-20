import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Cpu, Layers, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 space-y-10">
      <div className="space-y-3">
        <p className="text-xs font-mono font-semibold uppercase tracking-widest text-amber-600">
          ABOUT C-SPOT ACADEMY
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Bridging Academic CAD Theory &amp; Production Hardware Engineering
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          C-Spot Academy was founded by mechanical product designers and CAD
          architects to solve a recurring industry gap: engineering graduates
          often know how to extrude basic shapes, yet struggle when tasked with
          modifying parametric assemblies, applying GD&amp;T tolerances, or
          preparing shop-floor drawings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <Compass className="h-6 w-6 text-amber-600" />
          <h2 className="mt-3 font-bold text-slate-900">First-Principles CAD</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Every feature starts with clear datum selection, reference planes,
            and parametric resilience.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <Cpu className="h-6 w-6 text-sky-600" />
          <h2 className="mt-3 font-bold text-slate-900">Live Mentor Labs</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Real-time modeling sessions with live debugging, Q&amp;A, and
            structured cohort mentorship.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <Layers className="h-6 w-6 text-emerald-600" />
          <h2 className="mt-3 font-bold text-slate-900">DFM &amp; Portfolio Ready</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Graduate with industrial assemblies and manufacturing drawing
            packages ready for technical interviews.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="h-4 w-4" />
            NEXT COHORT ENROLLING NOW
          </div>
          <h3 className="text-xl font-bold">
            Join the Industrial SolidWorks 3D CAD Bootcamp
          </h3>
        </div>
        <Link
          href="/workshops/solidworks-cad-bootcamp"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 shrink-0"
        >
          View Workshop
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
