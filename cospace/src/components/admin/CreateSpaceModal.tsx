"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CreateSpaceModalProps, CreateSpaceFormData, SpaceType, Space } from "@/types";

const PRESET_IMAGES: { label: string; url: string }[] = [
  {
    label: "Escritorio",
    url: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Cabina",
    url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Sala de Juntas",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  },
];

const INITIAL_FORM: CreateSpaceFormData = {
  name: "",
  description: "",
  type: SpaceType.DESK,
  capacity: 1,
  pricePerHour: 15,
  imageUrl: PRESET_IMAGES[0].url,
};

export default function CreateSpaceModal({
  isOpen,
  onClose,
  onSpaceCreated,
}: CreateSpaceModalProps): React.JSX.Element | null {
  const [formData, setFormData] = useState<CreateSpaceFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        capacity: Number(formData.capacity),
        pricePerHour: Number(formData.pricePerHour),
        imageUrl: formData.imageUrl.trim(),
      };

      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        let err = data.error || "Error al crear el espacio";
        if (data.details?.fieldErrors) {
          const fieldMsgs = Object.values(data.details.fieldErrors).flat().join(", ");
          if (fieldMsgs) err = `${err}: ${fieldMsgs}`;
        }
        setErrorMsg(err);
        setLoading(false);
        return;
      }

      // Éxito: notificar al componente padre, resetear y cerrar
      const newSpace = data as Space;
      onSpaceCreated(newSpace);
      setFormData(INITIAL_FORM);
      onClose();
    } catch {
      setErrorMsg("Error de conexión al intentar crear el espacio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white dark:bg-[#0e0f15] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative my-8 backdrop-blur-2xl transition-colors">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-white transition cursor-pointer"
          aria-label="Cerrar modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
            Panel de Administración
          </span>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
            Crear Nuevo Espacio
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Ingresa las especificaciones del nuevo espacio de coworking.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-xs rounded-2xl font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Nombre del Espacio
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Hot Desk Vista Norte B-3"
              required
              minLength={3}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SpaceType })}
                className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 transition font-medium cursor-pointer"
              >
                <option value={SpaceType.DESK} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Escritorio (DESK)</option>
                <option value={SpaceType.MEETING_ROOM} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Sala de Juntas</option>
                <option value={SpaceType.BOOTH} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Cabina (BOOTH)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Capacidad
              </label>
              <input
                type="number"
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                required
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                Precio / h ($)
              </label>
              <input
                type="number"
                step="0.5"
                min={0.1}
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: parseFloat(e.target.value) || 0 })}
                required
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalla el mobiliario, equipo tecnológico y ambiente (mínimo 10 caracteres)..."
              required
              minLength={10}
              rows={3}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                URL de Imagen
              </label>
              <div className="flex gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Presets:</span>
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline font-medium cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              required
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 transition"
            />
            {formData.imageUrl && (
              <div className="mt-3 relative w-full h-24 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={formData.imageUrl}
                  alt="Vista previa de imagen"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-full border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:bg-zinc-400 dark:disabled:bg-zinc-700 disabled:text-zinc-200 dark:disabled:text-zinc-400"
            >
              {loading ? "Creando espacio..." : "Crear Espacio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
