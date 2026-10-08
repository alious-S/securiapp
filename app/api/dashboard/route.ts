import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const debutJour = new Date(now);
    debutJour.setHours(0, 0, 0, 0);
    const dans30j = new Date(now.getTime() + 30 * 86400000);

    // Une carte "valide" = celle qui passerait un contrôle
    const valide: Prisma.CardWhereInput = {
      statut: "actif",
      agent: { actif: true },
      OR: [{ expireAt: null }, { expireAt: { gt: now } }],
    };

    // À renouveler = active, agent sur le terrain, expirée ou expire sous 30 jours
    const aRenouveler: Prisma.CardWhereInput = {
      statut: "actif",
      agent: { actif: true },
      expireAt: { lt: dans30j },
    };

    const [
      agentsTotal,
      agentsActifs,
      cartesTotal,
      cartesValides,
      expirees,
      bientot,
      controlesJour,
      refusesJour,
      aTraiter,
      derniers,
    ] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({ where: { actif: true } }),
      prisma.card.count(),
      prisma.card.count({ where: valide }),
      prisma.card.count({
        where: { ...aRenouveler, expireAt: { lt: now } },
      }),
      prisma.card.count({
        where: { ...aRenouveler, expireAt: { gte: now, lt: dans30j } },
      }),
      prisma.verificationLog.count({
        where: { scannedAt: { gte: debutJour } },
      }),
      prisma.verificationLog.count({
        where: { scannedAt: { gte: debutJour }, resultat: "invalide" },
      }),
      prisma.card.findMany({
        where: aRenouveler,
        orderBy: { expireAt: "asc" },
        take: 6,
        select: {
          id: true,
          expireAt: true,
          agent: { select: { nom: true, prenom: true, matricule: true } },
        },
      }),
      prisma.verificationLog.findMany({
        orderBy: { scannedAt: "desc" },
        take: 5,
        select: {
          id: true,
          resultat: true,
          scannedAt: true,
          card: {
            select: {
              id: true,
              agent: { select: { nom: true, prenom: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      agents: {
        total: agentsTotal,
        actifs: agentsActifs,
        inactifs: agentsTotal - agentsActifs,
      },
      cartes: {
        total: cartesTotal,
        valides: cartesValides,
        expirees,
        bientot,
      },
      controles: { aujourdhui: controlesJour, refuses: refusesJour },
      aTraiter: aTraiter.map((c) => ({
        id: c.id,
        expireAt: c.expireAt,
        nom: c.agent.nom,
        prenom: c.agent.prenom,
        matricule: c.agent.matricule,
      })),
      derniers: derniers.map((l) => ({
        id: l.id,
        resultat: l.resultat,
        scannedAt: l.scannedAt,
        cardId: l.card?.id ?? null,
        nom: l.card?.agent.nom ?? null,
        prenom: l.card?.agent.prenom ?? null,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}