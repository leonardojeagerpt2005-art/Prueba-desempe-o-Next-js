import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { verifyAccessToken, TokenPayload } from "@/lib/jwt";

export interface AuthenticatedUser extends TokenPayload {}

export async function authenticateRequest(
  req: NextRequest,
  requiredRole?: Role
): Promise<{ user: AuthenticatedUser | null; errorResponse: NextResponse | null }> {
  const authHeader = req.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const token = req.cookies.get("access_token")?.value || headerToken;

  if (!token) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "No autenticado: Token de acceso no presente" },
        { status: 401 }
      ),
    };
  }

  const user = await verifyAccessToken(token);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "No autorizado: Token de acceso inválido o expirado" },
        { status: 401 }
      ),
    };
  }

  if (requiredRole && user.role !== requiredRole) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Prohibido: No tienes los permisos necesarios" },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}