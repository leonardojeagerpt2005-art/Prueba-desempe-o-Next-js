"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-0.5 text-xs font-medium">
      <button
        onClick={() => setLocale("es")}
        className={`px-2 py-0.5 rounded-full transition-all duration-200 ${
          locale === "es" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-0.5 rounded-full transition-all duration-200 ${
          locale === "en" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}