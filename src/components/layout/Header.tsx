'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Menu, X, ShieldCheck, Search } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-amber-400 shadow-sm ring-1 ring-slate-800 transition-transform group-hover:scale-105">
            <Compass className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900">
              C-SPOT <span className="text-amber-600">ACADEMY</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              CAD &amp; Product Engineering
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <Link
            href="/workshops/solidworks-cad-bootcamp"
            className="hover:text-slate-900 transition-colors"
          >
            SolidWorks Bootcamp
          </Link>
          <Link
            href="/courses/advanced-product-design-dfm"
            className="hover:text-slate-900 transition-colors"
          >
            Advanced DFM Track
          </Link>
          <Link
            href="/about"
            className="hover:text-slate-900 transition-colors"
          >
            Methodology
          </Link>
          <Link
            href="/lookup"
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-amber-600 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            Registration Lookup
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            Admin
          </Link>
          <Link
            href="/workshops/solidworks-cad-bootcamp/register"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
          >
            Enroll Now
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 space-y-3 md:hidden">
          <Link
            href="/workshops/solidworks-cad-bootcamp"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            SolidWorks 3D CAD Bootcamp
          </Link>
          <Link
            href="/courses/advanced-product-design-dfm"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Advanced Product Design Track
          </Link>
          <Link
            href="/lookup"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Registration Status &amp; Telegram Lookup
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            About C-Spot Academy
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/workshops/solidworks-cad-bootcamp/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-bold text-slate-950 hover:bg-amber-400"
            >
              Register for Live Workshop
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-xs font-medium text-slate-600"
            >
              Admin Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
