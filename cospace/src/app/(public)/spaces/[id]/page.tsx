import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/spaces/BookingForm";
import { SpaceDetailPageProps } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function SpaceDetailContent({
  params,
}: SpaceDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let space = null;
  try {
    space = await prisma.space.findUnique({
      where: { id },
    });
  } catch (error) {
    console.warn(`Failed to query space detail for ID ${id} at build/SSR time:`, error);
  }

  if (!space || !space.isActive) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/spaces"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <span>&larr;</span>
          <span>Volver al catálogo de espacios</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-lg dark:shadow-2xl shadow-zinc-200/50 dark:shadow-black/80 transition-colors">
        <div className="relative w-full h-72 sm:h-[420px] bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={space.imageUrl}
            alt={space.name}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-black/80 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              {space.type} &bull; Capacidad para {space.capacity} {space.capacity === 1 ? "persona" : "personas"}
            </span>

            <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-white">
              ${space.pricePerHour}{" "}
              <span className="text-xs font-normal text-zinc-500 font-sans">/ hora</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mt-4 tracking-tight">
            {space.name}
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 mt-4 text-sm sm:text-base leading-relaxed max-w-3xl">
            {space.description}
          </p>

          <hr className="my-10 border-zinc-200 dark:border-white/10" />

          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
              Configura tu Reserva
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Elige la fecha y el rango de horas deseadas para este espacio (máximo 4 horas continuas, horario de 07:00 a 21:00).
            </p>
            <BookingForm spaceId={space.id} pricePerHour={space.pricePerHour} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpaceDetailPage(props: SpaceDetailPageProps): React.JSX.Element {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-500 text-sm">Cargando detalle del espacio...</div>}>
      <SpaceDetailContent params={props.params} />
    </Suspense>
  );
}