import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const cookie = req.cookies.get("usuarioLogueado");

  const pathname = req.nextUrl.pathname;

  // RUTAS PUBLICAS

  if (pathname === "/login") {
    return NextResponse.next();
  }

  // SI NO ESTA LOGUEADO

  if (!cookie) {
    return NextResponse.redirect(
      new URL("/login", req.url),
    );
  }

  return NextResponse.next();
}

// RUTAS A PROTEGER

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ventas/:path*",
    "/productos/:path*",
    "/compras/:path*",
    "/clientes/:path*",
    "/deudas/:path*",
    "/proveedores/:path*",
    "/finanzas/:path*",
    "/gastos/:path*",
    "/caja/:path*",
  ],
};