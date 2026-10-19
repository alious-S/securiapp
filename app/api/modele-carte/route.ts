/**
 * MODÈLE DE CARTE : lecture (GET) et enregistrement (PUT)
 * Si la table n'existe pas encore en base, la lecture renvoie le modèle d'origine
 * et l'enregistrement explique quoi faire.
 */
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { chargerModele } from "@/lib/donnees";
import { lireModele, logoValide } from "@/lib/modele-carte";

export async function GET() {
  const m = await chargerModele();
  return NextResponse.json({
    nomOrganisation: m.nomOrganisation,
    aLogo: !!m.logoSrc,
    version: m.version,
    config: m.config,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const corps: unknown = await request.json().catch(() => null);
    if (!corps || typeof corps !== "object" || Array.isArray(corps)) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }
    const b = corps as Record<string, unknown>;

    const nom =
      typeof b.nomOrganisation === "string" ? b.nomOrganisation.trim().replace(/\s+/g, " ") : "";
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
    const message = String(erreur instanceof Error ? erreur.message : erreur);
    const baseAJour = !/ModeleCarte|modeleCarte|P2021|does not exist/i.test(message);
    return NextResponse.json(
      {
        error: baseAJour
          ? "Erreur serveur. Réessayez dans un instant."
          : "La base de données n'est pas à jour. Lancez « npx prisma db push » puis réessayez.",
      },
      { status: 500 }
    );
  }
}