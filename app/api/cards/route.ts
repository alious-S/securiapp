import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get("statut");
    const recherche = searchParams.get("q");

    const cards = await prisma.card.findMany({
      where: {
        ...(statut && statut !== "tous" ? { statut } : {}),
        ...(recherche
          ? {
              agent: {
                OR: [
                  { nom: { contains: recherche, mode: "insensitive" } },
                  { prenom: { contains: recherche, mode: "insensitive" } },
                  { matricule: { contains: recherche, mode: "insensitive" } },
                ],
              },
            }
          : {}),
      },
      include: { agent: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}