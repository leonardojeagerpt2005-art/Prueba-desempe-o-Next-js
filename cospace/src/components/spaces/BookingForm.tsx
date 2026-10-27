"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookingFormProps, BookingFormData } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BookingForm({
  spaceId,
  pricePerHour,
}: BookingFormProps): React.JSX.Element {
  const router = useRouter();
  const { t } = useLanguage();

  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }, []);

  const [formData, setFormData] = useState<BookingFormData>({
    date: tomorrowStr,
    startHour: 9,
    endHour: 11,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const durationHours = formData.endHour - formData.startHour;
  const isDurationValid = durationHours >= 1 && durationHours <= 4;
  const estimatedPrice = isDurationValid ? durationHours * pricePerHour : 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isDurationValid) {
      setErrorMsg("La duración debe ser entre 1 y 4 horas.");
      return;
    }

    try {
      setLoading(true);

      const pad = (n: number) => n.toString().padStart(2, "0");
      const startDate = new Date(`${formData.date}T${pad(formData.startHour)}:00:00`);
      const endDate = new Date(`${formData.date}T${pad(formData.endHour)}:00:00`);

      if (startDate <= new Date()) {
        setErrorMsg("La fecha y hora de reserva debe ser en el futuro.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push(`/login?from=/spaces/${spaceId}`);
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.error || "No se pudo completar la reserva.");
        setLoading(false);
        return;
      }

      setSuccessMsg("¡Reserva confirmada con éxito! Redirigiendo a tus reservas...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch {
      setErrorMsg("Error de conexión al procesar la reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm transition-colors">
      {errorMsg && (
        <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-xs sm:text-sm rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm rounded-xl font-medium">
          {successMsg}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            {t.detail.dateLabel}
          </label>
          <input
            type="date"
            value={formData.date}
            min={new Date().toISOString().split("T")[0]}
            max={maxDateStr}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2.5 bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 transition cursor-pointer"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            {t.detail.startHour}
          </label>
          <select
            value={formData.startHour}
            onChange={(e) => setFormData({ ...formData, startHour: parseInt(e.target.value, 10) })}
            className="w-full px-4 py-2.5 bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 transition cursor-pointer font-medium"
          >
            {Array.from({ length: 14 }, (_, i) => i + 7).map((hour) => (
              <option key={hour} value={hour} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                {hour}:00
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            {t.detail.endHour}
          </label>
          <select
            value={formData.endHour}
            onChange={(e) => setFormData({ ...formData, endHour: parseInt(e.target.value, 10) })}
            className="w-full px-4 py-2.5 bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 transition cursor-pointer font-medium"
          >
            {Array.from({ length: 14 }, (_, i) => i + 8).map((hour) => (
              <option key={hour} value={hour} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                {hour}:00
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
            {t.detail.totalPrice} ({durationHours > 0 ? durationHours : 0} h)
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-white mt-0.5">
            ${estimatedPrice.toFixed(2)}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isDurationValid}
          className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-xs sm:text-sm rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl shadow-zinc-900/10 dark:shadow-white/10 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 disabled:text-zinc-200 dark:disabled:text-zinc-400 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Procesando..." : t.detail.submitBtn}
        </button>
      </div>
    </form>
  );
}
