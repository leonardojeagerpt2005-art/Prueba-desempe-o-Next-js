"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Space, AdminSpacesTableProps } from "@/types";
import CreateSpaceModal from "@/components/admin/CreateSpaceModal";

export default function AdminSpacesTable({
  initialSpaces,
}: AdminSpacesTableProps): React.JSX.Element {
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "error" | "success"; text: string } | null>(
    null
  );

  const toggleStatus = async (space: Space) => {
    setAlertMsg(null);
    setLoadingId(space.id);

    try {
      const newStatus = !space.isActive;
      const res = await fetch(`/api/spaces/${space.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlertMsg({ type: "error", text: data.error || "Error al actualizar el estado" });
        return;
      }

      setSpaces((prev) =>
        prev.map((s) => (s.id === space.id ? { ...s, isActive: newStatus } : s))
      );
      setAlertMsg({
        type: "success",
        text: `Espacio "${space.name}" ${newStatus ? "activado" : "desactivado"} con éxito.`,
      });
    } catch {
      setAlertMsg({ type: "error", text: "Error de red al conectar con el servidor" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleSpaceCreated = (newSpace: Space) => {
    setSpaces((prev) => [newSpace, ...prev]);
    setAlertMsg({
      type: "success",
      text: `Espacio "${newSpace.name}" creado y activado con éxito.`,
    });
  };

  return (
    <div>
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Espacios Registrados ({spaces.length})
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Supervisa el inventario disponible y administra nuevos espacios on-demand.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-xs sm:text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-zinc-900/10 dark:shadow-white/10 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>+ Nuevo Espacio</span>
        </button>
      </div>

      {alertMsg && (
        <div
          className={`mb-6 p-4 rounded-2xl text-sm font-semibold border ${
            alertMsg.type === "error"
              ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300"
              : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {alertMsg.text}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-lg dark:shadow-2xl backdrop-blur-md transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-white/[0.03] border-b border-zinc-200 dark:border-white/10 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Espacio</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Capacidad</th>
                <th className="px-6 py-4">Precio / h</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5 font-medium">
              {spaces.map((space) => {
                const isLoading = loadingId === space.id;
                return (
                  <tr key={space.id} className="hover:bg-zinc-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex-shrink-0">
                        <Image
                          src={space.imageUrl}
                          alt={space.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white">{space.name}</div>
                        <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">{space.id.substring(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                        {space.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{space.capacity} pers.</td>
                    <td className="px-6 py-4 font-mono font-bold text-zinc-900 dark:text-white">${space.pricePerHour}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          space.isActive
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                            : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60"
                        }`}
                      >
                        {space.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleStatus(space)}
                        disabled={isLoading}
                        className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer disabled:opacity-50 ${
                          space.isActive
                            ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20"
                            : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20"
                        }`}
                      >
                        {isLoading
                          ? "Actualizando..."
                          : space.isActive
                          ? "Desactivar"
                          : "Activar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Creación */}
      <CreateSpaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSpaceCreated={handleSpaceCreated}
      />
    </div>
  );
}
