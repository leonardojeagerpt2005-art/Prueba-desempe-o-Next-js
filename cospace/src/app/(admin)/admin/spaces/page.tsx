import React, { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import AdminSpacesTable from "@/components/admin/AdminSpacesTable";
import { Space } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function SpacesTableData(): Promise<React.JSX.Element> {
  try {
    const spaces: Space[] = await prisma.space.findMany({
      orderBy: { createdAt: "desc" },
    });
    return <AdminSpacesTable initialSpaces={spaces} />;
  } catch (error) {
    console.warn("Failed to query spaces in admin page at build/SSR time:", error);
    return <AdminSpacesTable initialSpaces={[]} />;
  }
}

export default function AdminSpacesPage(): React.JSX.Element {
  return (
    <div className="py-4">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Gestión de Espacios de Coworking
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Supervisa el estado de cada espacio y gestiona su disponibilidad operativa (activar / desactivar).
        </p>
      </div>

      <Suspense fallback={<div className="p-12 text-center text-zinc-500 text-sm">Cargando espacios...</div>}>
        <SpacesTableData />
      </Suspense>
    </div>
  );
}
