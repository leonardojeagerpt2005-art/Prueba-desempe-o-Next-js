import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, TokenPayload } from "@/lib/jwt";
import { Role } from "@prisma/client";

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;

  const isPrivateRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  let payload: TokenPayload | null = null;
  if (accessToken) {
    payload = await verifyAccessToken(accessToken);
  }

  // 1. Si intenta ingresar a rutas privadas o admin sin token válido -> Redirigir a login
  if ((isPrivateRoute || isAdminRoute) && !payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Si entra a rutas de admin sin rol de ADMIN -> Redirigir a dashboard o prohibir
  if (isAdminRoute && payload?.role !== Role.ADMIN) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. Si ya está autenticado e intenta ir a login o register -> Redirigir a dashboard
  if (isAuthRoute && payload) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/login/:path*",
    "/register/:path*",
  ],
};