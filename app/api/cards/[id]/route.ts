import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { finDeJournee } from "@/lib/dates";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        agent: true,
        logs: { orderBy: { scannedAt: "desc" }, take: 10 },
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });
    }
    return NextResponse.json(card);
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
    const { action, expireAt } = body;

    let data: { statut?: string; expireAt?: Date | null; issuedAt?: Date } = {};

    if (action === "activer") {
      data = { statut: "actif" };
    } else if (action === "desactiver") {
      data = { statut: "desactive" };
    } else if (action === "revoquer") {
      data = { statut: "revoque" };
    } else if (action === "renouveler") {
      const fin = finDeJournee(expireAt);
      if (!fin || fin <= new Date()) {
        return NextResponse.json(
          { error: "Date d'expiration invalide." },
          { status: 400 }
        );
      }
      data = { statut: "actif", expireAt: fin, issuedAt: new Date() };
    } else {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    const card = await prisma.card.update({
      where: { id },
      data,
      include: { agent: true },
    });
    return NextResponse.json(card);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}