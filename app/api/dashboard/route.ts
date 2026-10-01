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
      prisma.card.count({
        where: { expireAt: { lt: now } },
      }),
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

    return NextResponse.json({
      totalCartes,
      cartesActives,
      cartesExpirees: cartesExpireesCount,
      cartesSuspendues,
      nombreAgents,
      verifsAujourdhui,
      verifsSemaine,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}