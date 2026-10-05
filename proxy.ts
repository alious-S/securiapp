import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/lib/auth";

// Routes API accessibles sans connexion
const API_PUBLIQUES = ["/api/verify/", "/api/auth/login", "/api/auth/logout"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );

  // Déjà connecté : inutile de revoir la page de connexion
  if (pathname === "/login") {
    if (session) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (API_PUBLIQUES.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Pages protégées : /admin et /carte
  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/carte/:path*", "/api/:path*", "/login"],
};