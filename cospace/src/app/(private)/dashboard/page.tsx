"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookingItem } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DashboardPage(): React.JSX.Element {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("No se pudieron cargar tus reservas.");
      const data: BookingItem[] = await res.json();
      setBookings(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido al cargar reservas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return;

    try {
      setCancellingId(bookingId);
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo cancelar la reserva");
        return;
      }

      await fetchBookings();
    } catch {
      alert("Error de conexión al intentar cancelar la reserva");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="py-4">
      {/* Top Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>

        <Link
          href="/spaces"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-black text-xs sm:text-sm font-semibold rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-zinc-900/10 dark:shadow-white/10"
        >
          <span>+ Nueva Reserva</span>
        </Link>
      </div>

      {loading && (
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 rounded-3xl p-14 text-center text-zinc-500 dark:text-zinc-400 text-sm backdrop-blur-md shadow-sm">
          <div className="inline-block w-6 h-6 border-2 border-zinc-400 border-t-zinc-900 dark:border-white/20 dark:border-t-white rounded-full animate-spin mb-3"></div>
          <p>Cargando tus reservas...</p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-sm rounded-2xl font-medium">
          {errorMsg}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 rounded-3xl p-14 text-center backdrop-blur-md shadow-xl">
          <p className="text-zinc-500 dark:text-zinc-400 text-base mb-6">{t.dashboard.empty}</p>
          <Link
            href="/spaces"
            className="inline-flex items-center justify-center px-6 py-3 bg-zinc-900 text-white dark:bg-white dark:text-black text-xs sm:text-sm font-semibold rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-zinc-900/10 dark:shadow-white/10"
          >
            Explorar Espacios Disponibles
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {bookings.map((booking) => {
          const start = new Date(booking.startTime);
          const end = new Date(booking.endTime);
          const isConfirmed = booking.status === "CONFIRMED";
          const now = new Date();
          const canCancel =
            isConfirmed &&
            start.getTime() - now.getTime() >= 2 * 60 * 60 * 1000;
          const isCancelling = cancellingId === booking.id;

          return (
            <div
              key={booking.id}
              className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-lg dark:shadow-2xl shadow-zinc-200/50 dark:shadow-black/60 backdrop-blur-md hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10">
                  <Image
                    src={booking.space.imageUrl}
                    alt={booking.space.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base sm:text-lg">
                      {booking.space.name}
                    </h3>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      {booking.space.type}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-1.5 flex items-center gap-1.5">
                    <span>📅 {start.toLocaleDateString()}</span>
                    <span>&bull;</span>
                    <span>⏰ {start.getHours()}:00 &mdash; {end.getHours()}:00</span>
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Total: <span className="text-zinc-900 dark:text-white font-mono font-bold text-base">${booking.totalPrice}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-white/5">
                <span
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full ${
                    isConfirmed
                      ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      : "bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {isConfirmed ? t.dashboard.confirmed : t.dashboard.cancelled}
                </span>

                {isConfirmed && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={!canCancel || isCancelling}
                    className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                      canCancel
                        ? "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
                        : "bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/40 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                    }`}
                    title={
                      !canCancel
                        ? t.dashboard.hoursAlert
                        : ""
                    }
                  >
                    {isCancelling ? "Cancelando..." : t.dashboard.cancelBtn}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}