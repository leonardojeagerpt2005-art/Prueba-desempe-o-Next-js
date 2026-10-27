"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SpaceCardProps, SpaceType } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SpaceCard({ space }: SpaceCardProps): React.JSX.Element {
  const { t } = useLanguage();

  const getSpaceTypeLabel = (type: SpaceType): string => {
    switch (type) {
      case SpaceType.DESK:
        return t.spaces.desk;
      case SpaceType.MEETING_ROOM:
        return t.spaces.meetingRoom;
      case SpaceType.BOOTH:
        return t.spaces.booth;
      default:
        return type;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-lg dark:shadow-2xl flex flex-col hover:border-zinc-400 dark:hover:border-white/25 transition-all duration-300 group">
      <div className="relative w-full h-52 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <Image
          src={space.imageUrl}
          alt={space.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/80 dark:bg-black/60 border border-zinc-200 dark:border-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          {getSpaceTypeLabel(space.type)}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors">
            {space.name}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
            {space.description}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 block font-medium">
              {t.spaces.capacity}: {space.capacity} {t.spaces.people}
            </span>
            <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-white mt-0.5">
              ${space.pricePerHour} <span className="text-xs font-normal text-zinc-500">{t.spaces.perHour}</span>
            </div>
          </div>
          <Link
            href={`/spaces/${space.id}`}
            className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-semibold rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            {t.spaces.viewDetails}
          </Link>
        </div>
      </div>
    </div>
  );
}
