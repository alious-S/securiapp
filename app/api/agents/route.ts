import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSecureToken } from "@/lib/token";
import { finDeJournee } from "@/lib/dates";

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
  return `AG-${String(max + 1).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nom = String(body.nom ?? "").trim();
    const prenom = String(body.prenom ?? "").trim();
    const agence = String(body.agence ?? "").trim();
    const fonction =
      String(body.fonction ?? "").trim() || "Agent de sécurité";
    const sexe = body.sexe;
    const photoUrl = body.photoUrl || null;

    if (!nom || !prenom || !agence) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }
    if (sexe !== "M" && sexe !== "F") {
      return NextResponse.json(
        { error: "Choisissez le sexe de l'agent." },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.findUnique({
      where: { id: "main" },
    });
    const duree = settings?.dureeValiditeJours ?? 365;
    const expiration = body.expireAt
      ? finDeJournee(body.expireAt)
      : new Date(Date.now() + duree * 86400000);

    if (!expiration || expiration <= new Date()) {
      return NextResponse.json(
        { error: "La date d'expiration doit être dans le futur." },
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
          sexe,
          fonction,
          photoUrl,
          cards: {
            create: {
              token: generateSecureToken(),
              statut: "actif",
              expireAt: expiration,
              issuedAt: new Date(),
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