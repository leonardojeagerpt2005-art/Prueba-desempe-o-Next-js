"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LocalClock(): React.JSX.Element {
  const { t } = useLanguage();
  const [timeString, setTimeString] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setTimeString(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Durante SSR y primer render se muestra un esqueleto ligero para evitar discrepancia
  if (!timeString) {
    return (
      <div className="text-xs text-zinc-500 font-mono flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse"></span>
        <span className="hidden lg:inline">{t.clock.localTime}</span>
        <span className="inline-block w-14 h-3 bg-white/10 animate-pulse rounded"></span>
      </div>
    );
  }

  return (
    <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span className="hidden lg:inline text-zinc-500">{t.clock.localTime}</span>
      <span className="font-semibold text-zinc-200">{timeString}</span>
    </div>
  );
}