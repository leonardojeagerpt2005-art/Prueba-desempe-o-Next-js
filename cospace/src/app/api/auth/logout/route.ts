import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, verifyAccessToken } from "@/lib/jwt";
import { clearAuthCookies } from "@/lib/cookies";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    const accessToken = req.cookies.get("access_token")?.value;

    let userId: string | null = null;
    if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken);
      if (payload) {
        userId = payload.userId;
      }
    }
    if (!userId && accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload) {
        userId = payload.userId;
      }
    }

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });
    }

    const response = NextResponse.json({ message: "Sesión cerrada correctamente" });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    console.error("Error en POST /api/auth/logout:", error);
    const response = NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 });
    clearAuthCookies(response);
    return response;
  }
}