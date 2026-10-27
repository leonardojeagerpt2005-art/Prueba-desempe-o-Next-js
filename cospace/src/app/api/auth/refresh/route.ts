import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken } from "@/lib/jwt";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const refreshTokenCookie = req.cookies.get("refresh_token")?.value;

    if (!refreshTokenCookie) {
      return NextResponse.json({ error: "Token de actualización no proporcionado" }, { status: 401 });
    }

    const payload = await verifyRefreshToken(refreshTokenCookie);
    if (!payload) {
      return NextResponse.json({ error: "Token de actualización inválido o expirado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.refreshTokenHash) {
      return NextResponse.json({ error: "Sesión no encontrada o revocada" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(refreshTokenCookie, user.refreshTokenHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Token de actualización revocado" }, { status: 401 });
    }

    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ message: "Token renovado con éxito" });

    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    return response;
  } catch (error) {
    console.error("Error en POST /api/auth/refresh:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}