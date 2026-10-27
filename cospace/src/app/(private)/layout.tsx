"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/auth/AuthContext";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import ThemeToggle from "@/components/shared/ThemeToggle";
import LocalClock from "@/components/shared/LocalClock";
import { Role } from "@prisma/client";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#090a0f] dark:text-zinc-100 transition-colors duration-200">
      {/* Floating Pill Header */}
      <header className="sticky top-4 z-50 px-4 w-full flex justify-center">
        <div className="w-full max-w-5xl h-14 px-4 sm:px-6 flex items-center justify-between rounded-full bg-white/80 dark:bg-black/60 border border-zinc-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg dark:shadow-2xl shadow-zinc-200/50 dark:shadow-black/80 transition-all">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition">
              CoSpace
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </Link>

          <div className="hidden md:flex items-center">
            <LocalClock />
          </div>

          <nav className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium">
            <Link
              href="/spaces"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              {t.nav.spaces}
            </Link>
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-900 dark:text-white font-medium text-xs border border-zinc-200 dark:border-white/10 transition-all"
            >
              {t.nav.dashboard}
            </Link>

            {user?.role === Role.ADMIN && (
              <Link
                href="/admin/spaces"
                className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
              >
                {t.nav.admin}
              </Link>
            )}

            <button
              type="button"
              onClick={logout}
              className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium px-2 py-1 transition-colors cursor-pointer"
            >
              {t.nav.logout}
            </button>

            <LanguageSwitcher />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-white/5 py-12 text-center text-xs text-zinc-500 bg-zinc-100/60 dark:bg-black/40 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-800 dark:text-zinc-300">CoSpace</span>
            <span>&copy; 2026</span>
          </div>
          <p className="text-zinc-500">
            Next-Generation Autonomous &amp; Flexible Coworking Infrastructure.
          </p>
          <div className="flex items-center gap-6 text-zinc-500 dark:text-zinc-400">
            <Link href="/spaces" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              {t.nav.spaces}
            </Link>
            <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              {t.nav.dashboard}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}