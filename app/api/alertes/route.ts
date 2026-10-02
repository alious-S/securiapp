import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const uneHeureAvant = new Date(Date.now() - 60 * 60 * 1000);
    const vingtQuatreHeures = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Cartes révoquées/désactivées scannées récemment
    const logsSurCartesInvalides = await prisma.verificationLog.findMany({
      where: {
        scannedAt: { gte: vingtQuatreHeures },
        resultat: "invalide",
        card: { statut: { in: ["revoque", "desactive"] } },
      },
      include: { card: { include: { agent: true } } },
      orderBy: { scannedAt: "desc" },
    });

    // 2. Cartes valides scannées anormalement souvent (> 5 fois / heure)
    const scansRecents = await prisma.verificationLog.findMany({
      where: {
        scannedAt: { gte: uneHeureAvant },
        resultat: "valide",
        cardId: { not: null },
      },
      include: { card: { include: { agent: true } } },
    });

    const comptageParCarte = new Map<string, { count: number; card: typeof scansRecents[0]["card"] }>();
    for (const log of scansRecents) {
      if (!log.card) continue;
      const existant = comptageParCarte.get(log.cardId!);
      if (existant) {
        existant.count++;
      } else {
        comptageParCarte.set(log.cardId!, { count: 1, card: log.card });
      }
    }
    const cartesFrequenceAnormale = Array.from(comptageParCarte.values()).filter(
      (c) => c.count > 5
    );

    // 3. Tentatives sur tokens inexistants (dernières 24h)
    const tentativesInconnues = await prisma.verificationLog.count({
      where: {
        scannedAt: { gte: vingtQuatreHeures },
        resultat: "invalide",
        cardId: null,
      },
    });

    return NextResponse.json({
      cartesInvalidesUtilisees: logsSurCartesInvalides,
      cartesFrequenceAnormale,
      tentativesInconnues,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}