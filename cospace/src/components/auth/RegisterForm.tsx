"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RegisterFormData } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/auth/AuthContext";

export default function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, checkSession } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
      router.refresh();
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Error al registrar la cuenta");
        setLoading(false);
        return;
      }

      await checkSession();
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErrorMsg("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          {t.nav.register}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Crea tu cuenta para comenzar a reservar espacios
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-xs sm:text-sm rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Nombre Completo
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Juan Pérez"
            required
            minLength={2}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ejemplo@correo.com"
            required
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-zinc-900/10 dark:shadow-white/10 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 disabled:text-zinc-200 dark:disabled:text-zinc-400 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Creando cuenta..." : t.nav.register}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
        ¿Ya tienes una cuenta registrada?{" "}
        <Link href="/login" className="text-zinc-900 dark:text-white font-semibold hover:underline ml-1">
          {t.nav.login}
        </Link>
      </div>
    </div>
  );
}
