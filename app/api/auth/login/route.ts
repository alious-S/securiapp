import { NextRequest, NextResponse } from "next/server";
import { compare, hashSync } from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  cookieOptions,
  createSessionToken,
} from "@/lib/auth";

const MAX_ESSAIS = 5;
const VERROU_MINUTES = 15;

// Hash factice : le temps de réponse reste identique que l'email existe ou non
const FAUX_HASH = hashSync("mot-de-passe-factice", 10);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Renseignez votre email et votre mot de passe." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (admin?.lockedUntil && admin.lockedUntil > new Date()) {
      const minutes = Math.ceil(
        (admin.lockedUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${minutes} min.` },
        { status: 429 }
      );
    }

    const ok = await compare(password, admin?.passwordHash ?? FAUX_HASH);

    if (!admin || !ok) {
      if (admin) {
        const essais = admin.failedAttempts + 1;
        await prisma.admin.update({
          where: { id: admin.id },
          data:
            essais >= MAX_ESSAIS
              ? {
                  failedAttempts: 0,
                  lockedUntil: new Date(Date.now() + VERROU_MINUTES * 60000),
                }
              : { failedAttempts: essais },
        });
      }
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    if (admin.failedAttempts > 0 || admin.lockedUntil) {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { failedAttempts: 0, lockedUntil: null },
      });
    }

    const token = await createSessionToken({
      id: admin.id,
      email: admin.email,
      nom: admin.nom,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, cookieOptions);
    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur serveur. Réessayez dans un instant." },
      { status: 500 }
    );
  }
}