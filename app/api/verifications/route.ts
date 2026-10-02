import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periode = searchParams.get("periode"); // "aujourdhui" | "semaine" | "mois" | "tous"
    const resultat = searchParams.get("resultat"); // "valide" | "invalide" | "tous"

    const now = new Date();
    let dateDebut: Date | undefined;

    if (periode === "aujourdhui") {
      dateDebut = new Date(now);
      dateDebut.setHours(0, 0, 0, 0);
    } else if (periode === "semaine") {
      dateDebut = new Date(now);
      dateDebut.setDate(now.getDate() - 7);
    } else if (periode === "mois") {
      dateDebut = new Date(now);
      dateDebut.setMonth(now.getMonth() - 1);
    }

    const logs = await prisma.verificationLog.findMany({
      where: {
        ...(dateDebut ? { scannedAt: { gte: dateDebut } } : {}),
        ...(resultat && resultat !== "tous" ? { resultat } : {}),
      },
      include: {
        card: {
          include: { agent: true },
        },
      },
      orderBy: { scannedAt: "desc" },
      take: 200,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}