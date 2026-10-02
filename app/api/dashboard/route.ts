import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const debutAujourdhui = new Date(now);
    debutAujourdhui.setHours(0, 0, 0, 0);

    const debutSemaine = new Date(now);
    debutSemaine.setDate(now.getDate() - 7);

    const [
      totalCartes,
      cartesActives,
      cartesExpireesCount,
      cartesSuspendues,
      nombreAgents,
      verifsAujourdhui,
      verifsSemaine,
    ] = await Promise.all([
      prisma.card.count(),
      prisma.card.count({
        where: {
          statut: "actif",
          OR: [{ expireAt: null }, { expireAt: { gt: now } }],
        },
      }),
      prisma.card.count({ where: { expireAt: { lt: now } } }),
      prisma.card.count({
        where: { statut: { in: ["desactive", "revoque"] } },
      }),
      prisma.agent.count(),
      prisma.verificationLog.count({
        where: { scannedAt: { gte: debutAujourdhui } },
      }),
      prisma.verificationLog.count({
        where: { scannedAt: { gte: debutSemaine } },
      }),
    ]);

    // Vérifications des 7 derniers jours (pour le graphique)
    const verifsParJour = [];
    for (let i = 6; i >= 0; i--) {
      const debut = new Date(now);
      debut.setDate(now.getDate() - i);
      debut.setHours(0, 0, 0, 0);
      const fin = new Date(debut);
      fin.setDate(debut.getDate() + 1);

      const count = await prisma.verificationLog.count({
        where: { scannedAt: { gte: debut, lt: fin } },
      });

      verifsParJour.push({
        jour: debut.toLocaleDateString("fr-FR", { weekday: "short" }),
        total: count,
      });
    }

    return NextResponse.json({
      totalCartes,
      cartesActives,
      cartesExpirees: cartesExpireesCount,
      cartesSuspendues,
      nombreAgents,
      verifsAujourdhui,
      verifsSemaine,
      verifsParJour,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}