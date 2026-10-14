/**
 * MODÈLE DE CARTE : lecture (GET) et enregistrement (PUT)
 * GET ?leger=1 : seulement le nom et la présence d'un logo (pour le menu).
 */
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { lireModele, logoValide } from "@/lib/modele-carte";

export async function GET(request: NextRequest) {
  try {
    const leger = new URL(request.url).searchParams.get("leger") === "1";
    const [settings, modele] = await Promise.all([
      prisma.settings.findUnique({ where: { id: "main" } }),
      prisma.modeleCarte.findUnique({ where: { id: "main" } }),
    ]);

    const base = {
      nomOrganisation: settings?.nomOrganisation ?? "SecuriApp",
      aLogo: !!modele?.logoUrl,
      version: modele?.updatedAt ? new Date(modele.updatedAt).getTime() : 0,
    };
    return NextResponse.json(leger ? base : { ...base, config: lireModele(modele?.config) });
  } catch (erreur) {
    console.error(erreur);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const corps: unknown = await request.json().catch(() => null);
    if (!corps || typeof corps !== "object" || Array.isArray(corps)) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }
    const b = corps as Record<string, unknown>;

    const nom =
      typeof b.nomOrganisation === "string"
        ? b.nomOrganisation.trim().replace(/\s+/g, " ")
        : "";
    if (!nom || nom.length > 80) {
      return NextResponse.json(
        { error: "Le nom de l'entreprise est obligatoire (80 caractères maximum)." },
        { status: 400 }
      );
    }

    // logo : absent = on garde l'ancien, null = on le retire, texte = nouveau logo
    let logo: string | null | undefined;
    if (b.logo === undefined) logo = undefined;
    else if (b.logo === null) logo = null;
    else if (logoValide(b.logo)) logo = b.logo;
    else {
      return NextResponse.json(
        { error: "Le logo est invalide ou trop lourd. Utilisez un PNG ou un JPEG." },
        { status: 400 }
      );
    }

    // lireModele nettoie tout : une valeur incorrecte devient la valeur par défaut
    const config = lireModele(b.config) as unknown as Prisma.InputJsonObject;

    const [, modele] = await prisma.$transaction([
      prisma.settings.upsert({
        where: { id: "main" },
        update: { nomOrganisation: nom },
        create: { id: "main", nomOrganisation: nom },
      }),
      prisma.modeleCarte.upsert({
        where: { id: "main" },
        update: { config, ...(logo !== undefined ? { logoUrl: logo } : {}) },
        create: { id: "main", config, logoUrl: logo ?? null },
      }),
    ]);

    return NextResponse.json({ ok: true, version: new Date(modele.updatedAt).getTime() });
  } catch (erreur) {
    console.error(erreur);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}