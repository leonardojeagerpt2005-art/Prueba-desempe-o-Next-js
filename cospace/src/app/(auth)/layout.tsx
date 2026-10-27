"use client";

import React from "react";
import Link from "next/link";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-zinc-50 text-zinc-900 dark:bg-[#090a0f] dark:text-zinc-100 overflow-hidden transition-colors duration-200">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-blue-600/10 dark:from-blue-600/15 via-emerald-500/10 to-transparent blur-3xl opacity-70 pointer-events-none -z-10"
      />

      {/* Floating header */}
      <header className="w-full pt-6 px-4 flex justify-center z-20">
        <div className="w-full max-w-md h-12 px-5 flex items-center justify-between rounded-full bg-white/80 dark:bg-black/60 border border-zinc-200 dark:border-white/10 backdrop-blur-xl shadow-lg dark:shadow-xl">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition">
              CoSpace
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 z-10">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-3xl backdrop-blur-xl shadow-xl dark:shadow-2xl dark:shadow-black/80 p-8 sm:p-10 transition-colors">
          {children}
        </div>
      </main>

      {/* Subtle footer */}
      <footer className="py-6 text-center text-xs text-zinc-500 border-t border-zinc-200 dark:border-white/5 bg-zinc-100/60 dark:bg-black/40">
        <p>CoSpace &copy; 2026 &mdash; Autonomous Coworking Platform</p>
      </footer>
    </div>
  );
}