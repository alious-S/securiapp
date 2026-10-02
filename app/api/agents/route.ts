import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSecureToken } from "@/lib/token";

async function genererMatricule(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
) {
  const agents = await tx.agent.findMany({
    where: { matricule: { startsWith: "AG-" } },
    select: { matricule: true },
  });

  let max = 0;
  for (const a of agents) {
    const match = a.matricule.match(/^AG-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > max) max = num;
    }
  }

  const next = max + 1;
  return `AG-${String(next).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, prenom, agence, photoUrl } = body;

    if (!nom || !prenom || !agence) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const agent = await prisma.$transaction(async (tx) => {
      const matricule = await genererMatricule(tx);

      return tx.agent.create({
        data: {
          nom,
          prenom,
          matricule,
          agence,
          photoUrl: photoUrl || null,
          cards: {
            create: {
              token: generateSecureToken(),
              statut: "actif",
            },
          },
        },
        include: { cards: true },
      });
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'agent" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: { cards: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(agents);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des agents" },
      { status: 500 }
    );
  }
}