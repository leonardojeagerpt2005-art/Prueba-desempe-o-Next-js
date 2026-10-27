import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth-guard";
import { Role, SpaceType, Prisma } from "@prisma/client";

const createSpaceSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  type: z.nativeEnum(SpaceType, { message: "Tipo de espacio inválido" }),
  capacity: z.number().int().positive("La capacidad debe ser un número entero positivo"),
  pricePerHour: z.number().positive("El precio por hora debe ser positivo"),
  imageUrl: z.string().url("Debe ser una URL válida"),
});

// GET /api/spaces -> Listar espacios (Público ve solo activos; Admin con ?all=true ve todos)
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";

    const whereClause: Prisma.SpaceWhereInput = {};

    if (!showAll) {
      whereClause.isActive = true;
    } else {
      const { user } = await authenticateRequest(req);
      if (user?.role !== Role.ADMIN) {
        whereClause.isActive = true;
      }
    }

    const spaces = await prisma.space.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(spaces, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/spaces:", error);
    return NextResponse.json({ error: "Error interno al obtener espacios" }, { status: 500 });
  }
}

// POST /api/spaces -> Crear espacio (Solo ADMIN)
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { errorResponse } = await authenticateRequest(req, Role.ADMIN);
    if (errorResponse) return errorResponse;

    const body: unknown = await req.json();
    const result = createSpaceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos del espacio inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const space = await prisma.space.create({
      data: result.data,
    });

    return NextResponse.json(space, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/spaces:", error);
    return NextResponse.json({ error: "Error interno al crear el espacio" }, { status: 500 });
  }
}
