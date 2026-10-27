import React, { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SpaceCard from "@/components/spaces/SpaceCard";
import { Space } from "@/types";

async function SpacesList(): Promise<React.JSX.Element> {
  const spaces: Space[] = await prisma.space.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (spaces.length === 0) {
    return (
      <div className="bg-zinc-900/30 border border-white/10 rounded-3xl p-14 text-center text-zinc-400 font-medium backdrop-blur-md shadow-2xl">
        No hay espacios disponibles en este momento. Por favor vuelve a consultar más tarde.
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {spaces.map((space) => (
        <SpaceCard key={space.id} space={space} />
      ))}
    </div>
  );
}

export default function SpacesPage(): React.JSX.Element {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Catálogo de Espacios
        </h1>
        <p className="text-zinc-400 mt-2 text-base">
          Selecciona el entorno ideal según tus necesidades productivas y reserva por horas.
        </p>
      </div>

      <Suspense fallback={<div className="p-12 text-center text-zinc-500 text-sm">Cargando catálogo de espacios...</div>}>
        <SpacesList />
      </Suspense>
    </div>
  );
}