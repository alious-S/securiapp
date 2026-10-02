import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: { cards: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.actif !== undefined && typeof body.actif !== "boolean") {
      return NextResponse.json(
        { error: "Le statut actif doit être un booléen" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        ...(body.actif !== undefined ? { actif: body.actif } : {}),
        ...(body.nom ? { nom: body.nom } : {}),
        ...(body.prenom ? { prenom: body.prenom } : {}),
        ...(body.agence ? { agence: body.agence } : {}),
      },
      include: { cards: true },
    });

    return NextResponse.json(agent);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}