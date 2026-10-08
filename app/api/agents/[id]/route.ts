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

    const data: {
      actif?: boolean;
      nom?: string;
      prenom?: string;
      agence?: string;
      fonction?: string;
      sexe?: string;
    } = {};

    if (typeof body.actif === "boolean") data.actif = body.actif;
    for (const k of ["nom", "prenom", "agence", "fonction"] as const) {
      if (typeof body[k] === "string" && body[k].trim()) {
        data[k] = body[k].trim();
      }
    }
    if (body.sexe === "M" || body.sexe === "F") data.sexe = body.sexe;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Rien à modifier" }, { status: 400 });
    }

    const agent = await prisma.agent.update({
      where: { id },
      data,
      include: { cards: true },
    });
    return NextResponse.json(agent);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}