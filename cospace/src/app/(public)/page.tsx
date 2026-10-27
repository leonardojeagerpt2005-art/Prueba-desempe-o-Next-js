"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/auth/AuthContext";
import MotionReveal from "@/components/shared/MotionReveal";
import { Space, SpaceType } from "@/types";

const INITIAL_SPACES: Space[] = [
  {
    id: "default-desk",
    name: "Hot Desk Creativo A-1",
    description: "Escritorio flexible individual con monitor ergonómico 4K, conexión gigabit y café de cortesía.",
    type: SpaceType.DESK,
    capacity: 1,
    pricePerHour: 15,
    imageUrl: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "default-booth",
    name: "Cabina Insonorizada Silens 02",
    description: "Cabina acojinada con aislamiento acústico completo, optimizada para llamadas y videollamadas.",
    type: SpaceType.BOOTH,
    capacity: 1,
    pricePerHour: 22,
    imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "default-meeting",
    name: "Sala de Juntas Vanguardia",
    description: "Sala ejecutiva para reuniones de equipo. Pantalla interactiva 4K, pizarra y videobar.",
    type: SpaceType.MEETING_ROOM,
    capacity: 8,
    pricePerHour: 60,
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function HomePage(): React.JSX.Element {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);

  useEffect(() => {
    async function loadSpaces(): Promise<void> {
      try {
        const res = await fetch("/api/spaces");
        if (res.ok) {
          const data: Space[] = await res.json();
          if (data && data.length > 0) {
            setSpaces(data.slice(0, 3));
          }
        }
      } catch {
        // En caso de error de red, mantiene INITIAL_SPACES
      }
    }
    loadSpaces();
  }, []);

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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 px-4 flex flex-col items-center justify-center text-center">
        {/* Ambient radial glow background */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[450px] bg-gradient-to-b from-blue-600/15 via-emerald-500/10 to-transparent blur-3xl opacity-60 pointer-events-none -z-10"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Pulsing Pill Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-200/60 dark:bg-white/[0.04] border border-zinc-300 dark:border-white/10 text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-8 backdrop-blur-md shadow-inner"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">
              {t.home.cta.badge} &mdash; {locale === "es" ? "Espacios Autónomos" : "Autonomous Spaces"}
            </span>
          </motion.div>

          {/* Staggered Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.08]"
          >
            {t.home.heroTitle}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed"
          >
            {t.home.heroSubtitle}
          </motion.p>

          {/* CTAs with Framer Motion hover */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/spaces"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xl shadow-zinc-900/10 dark:shadow-white/10"
              >
                <span>{t.home.exploreBtn}</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>

            {/* If user is logged in, show Dashboard link instead of Login button */}
            {user ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-zinc-200/70 dark:bg-white/[0.04] border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-zinc-300 hover:text-black dark:hover:text-white font-medium text-sm hover:bg-zinc-200 dark:hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  <span>{t.nav.dashboard}</span>
                  <span>&rarr;</span>
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-zinc-200/70 dark:bg-white/[0.04] border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-zinc-300 hover:text-black dark:hover:text-white font-medium text-sm hover:bg-zinc-200 dark:hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  {t.nav.login}
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* 2. MÉTRICAS / SPECS RÁPIDOS */}
      <section className="border-y border-zinc-200 dark:border-white/5 bg-zinc-100/70 dark:bg-zinc-950/60 backdrop-blur-md py-12 px-4 transition-colors">
        <div className="max-w-6xl mx-auto">
          <MotionReveal direction="up" delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white tracking-tight">
                  {t.home.specs.displayTitle}
                </span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest mt-2">
                  {t.home.specs.displayDesc}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white tracking-tight">
                  {t.home.specs.speedTitle}
                </span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest mt-2">
                  {t.home.specs.speedDesc}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white tracking-tight">
                  {t.home.specs.hoursTitle}
                </span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest mt-2">
                  {t.home.specs.hoursDesc}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white tracking-tight">
                  {t.home.specs.flexTitle}
                </span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest mt-2">
                  {t.home.specs.flexDesc}
                </span>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* 3. CATÁLOGO PREVIEW (3 TARJETAS) */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <MotionReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
                {locale === "es" ? "Catálogo Curado" : "Curated Spaces"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mt-2">
                {t.spaces.title}
              </h2>
            </div>
            <Link
              href="/spaces"
              className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <span>{locale === "es" ? "Explorar todos los espacios" : "View all workspaces"}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </MotionReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {spaces.map((space, index) => (
            <MotionReveal key={space.id} delay={0.15 * (index + 1)} direction="up">
              <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 backdrop-blur-md overflow-hidden hover:border-zinc-400 dark:hover:border-white/25 transition-all duration-500 flex flex-col group h-full shadow-lg shadow-zinc-200/50 dark:shadow-2xl dark:shadow-black/40">
                <div className="relative w-full h-56 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  <Image
                    src={space.imageUrl}
                    alt={space.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-800 dark:text-zinc-200">
                    {getSpaceTypeLabel(space.type)}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/80 dark:bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {space.capacity} {t.spaces.people}
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
                      <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-white">
                        ${space.pricePerHour}
                        <span className="text-xs font-normal text-zinc-500 ml-1">
                          {t.spaces.perHour}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={space.id.startsWith("default-") ? "/spaces" : `/spaces/${space.id}`}
                      className="px-4 py-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-sm"
                    >
                      {t.spaces.viewDetails}
                    </Link>
                  </div>
                </div>
              </div>
            </MotionReveal>
          ))}
        </div>
      </section>

      {/* 4. SECCIÓN BENEFICIOS ESENCIALES */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <MotionReveal direction="up">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              {locale === "es" ? "Ventajas del Ecosistema" : "Ecosystem Advantages"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mt-2">
              {t.home.featuresTitle}
            </h2>
          </div>
        </MotionReveal>

        <div className="grid md:grid-cols-3 gap-8">
          <MotionReveal delay={0.1} direction="up">
            <div className="p-8 rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-white/15 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-sm mb-6 text-emerald-600 dark:text-emerald-400 font-mono">
                01
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{t.home.feature1Title}</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t.home.feature1Desc}
              </p>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.2} direction="up">
            <div className="p-8 rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-white/15 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-sm mb-6 text-emerald-600 dark:text-emerald-400 font-mono">
                02
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{t.home.feature2Title}</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t.home.feature2Desc}
              </p>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.3} direction="up">
            <div className="p-8 rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-white/15 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-sm mb-6 text-emerald-600 dark:text-emerald-400 font-mono">
                03
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{t.home.feature3Title}</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t.home.feature3Desc}
              </p>
            </div>
          </MotionReveal>
        </div>
      </section>

      {/* 5. CALL TO ACTION FINAL */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <MotionReveal direction="up">
          <div className="relative rounded-3xl p-10 sm:p-16 text-center border border-zinc-200 dark:border-white/10 bg-gradient-to-b from-zinc-100 to-white dark:from-white/[0.04] dark:to-transparent backdrop-blur-xl overflow-hidden shadow-2xl">
            <div
              aria-hidden="true"
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"
            />
            <span className="inline-block px-3 py-1 rounded-full bg-zinc-200/80 dark:bg-white/[0.05] border border-zinc-300 dark:border-white/10 text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-6">
              {locale === "es" ? "Acceso Inmediato" : "Instant Access"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight max-w-2xl mx-auto leading-tight">
              {t.home.cta.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
              {t.home.cta.subtitle}
            </p>
            <div className="mt-8 flex justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={user ? "/dashboard" : "/register"}
                  className="px-8 py-3.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xl shadow-zinc-900/10 dark:shadow-white/20"
                >
                  {user
                    ? locale === "es"
                      ? "Ir a mi Panel de Reservas"
                      : "Go to My Dashboard"
                    : t.home.cta.btn}
                </Link>
              </motion.div>
            </div>
          </div>
        </MotionReveal>
      </section>
    </div>
  );
}