import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { SESSION_COOKIE, cookieOptions } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.id },
    select: { nom: true, email: true },
  });

  // Compte supprimé : on efface aussi le cookie
  if (!admin) {
    const res = NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return res;
  }

  return NextResponse.json(admin);
}