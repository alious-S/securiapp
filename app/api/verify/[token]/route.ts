import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const card = await prisma.card.findUnique({
      where: { token },
      include: { agent: true },
    });

    // Log de la tentative de vérification
    const ipAddress = request.headers.get("x-forwarded-for") || "inconnu";

    if (!card) {
      await prisma.verificationLog.create({
        data: { resultat: "invalide", ipAddress },
      });
      return NextResponse.json(
        { valide: false, message: "Cette carte n'existe pas" },
        { status: 404 }
      );
    }

    const estExpiree = card.expireAt && card.expireAt < new Date();
    const estValide = card.statut === "actif" && !estExpiree;

    await prisma.verificationLog.create({
      data: {
        resultat: estValide ? "valide" : "invalide",
        cardId: card.id,
        ipAddress,
      },
    });

    if (!estValide) {
      return NextResponse.json(
        {
          valide: false,
          message:
            card.statut === "revoque"
              ? "Cette carte a été révoquée"
              : "Cette carte a expiré",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valide: true,
      agent: {
        nom: card.agent.nom,
        prenom: card.agent.prenom,
        matricule: card.agent.matricule,
        agence: card.agent.agence,
        photoUrl: card.agent.photoUrl,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}