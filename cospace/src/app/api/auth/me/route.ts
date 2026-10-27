import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse || !user) {
      return (
        errorResponse ||
        NextResponse.json({ error: "No autenticado: Token de acceso no presente o inválido" }, { status: 401 })
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    return NextResponse.json({ user: dbUser }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/auth/me:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
