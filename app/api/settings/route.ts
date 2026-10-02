import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "main" },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "main" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const settings = await prisma.settings.upsert({
      where: { id: "main" },
      update: {
        nomOrganisation: body.nomOrganisation,
        dureeValiditeJours: body.dureeValiditeJours,
      },
      create: {
        id: "main",
        nomOrganisation: body.nomOrganisation,
        dureeValiditeJours: body.dureeValiditeJours,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}