import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSecureToken } from "@/lib/token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, prenom, matricule, agence, photoUrl } = body;

    if (!nom || !prenom || !matricule || !agence) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
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
      include: {
        cards: true,
      },
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
      include: {
        cards: true,
      },
      orderBy: {
        createdAt: "desc",
      },
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