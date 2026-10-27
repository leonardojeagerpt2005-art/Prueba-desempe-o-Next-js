import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth-guard";
import { Role, SpaceType, BookingStatus } from "@prisma/client";

const updateSpaceSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  type: z.nativeEnum(SpaceType).optional(),
  capacity: z.number().int().positive().optional(),
  pricePerHour: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/spaces/[id] -> Detalle de espacio (Público)
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 });
    }

    return NextResponse.json(space, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/spaces/[id]:", error);
    return NextResponse.json({ error: "Error interno al consultar el espacio" }, { status: 500 });
  }
}

// PATCH /api/spaces/[id] -> Modificar o Desactivar espacio (Solo ADMIN)
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { errorResponse } = await authenticateRequest(req, Role.ADMIN);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body: unknown = await req.json();
    const result = updateSpaceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos de actualización inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const existingSpace = await prisma.space.findUnique({ where: { id } });
    if (!existingSpace) {
      return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 });
    }

    // Regla de Negocio: No se puede desactivar un espacio con reservas futuras confirmadas
    if (result.data.isActive === false && existingSpace.isActive === true) {
      const now = new Date();
      const futureBookingsCount = await prisma.booking.count({
        where: {
          spaceId: id,
          status: BookingStatus.CONFIRMED,
          startTime: { gt: now },
        },
      });

      if (futureBookingsCount > 0) {
        return NextResponse.json(
          {
            error: "No se puede desactivar el espacio porque cuenta con reservas futuras confirmadas",
          },
          { status: 409 }
        );
      }
    }

    const updatedSpace = await prisma.space.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updatedSpace, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/spaces/[id]:", error);
    return NextResponse.json({ error: "Error interno al actualizar el espacio" }, { status: 500 });
  }
}
