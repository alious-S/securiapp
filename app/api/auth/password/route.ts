import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const actuel = String(body?.actuel ?? "");
    const nouveau = String(body?.nouveau ?? "");

    if (nouveau.length < 8 || nouveau.length > 72) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit contenir entre 8 et 72 caractères." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { id: session.id } });
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ok = await compare(actuel, admin.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Le mot de passe actuel est incorrect." },
        { status: 400 }
      );
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: await hash(nouveau, 10) },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}