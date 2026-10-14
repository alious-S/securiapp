import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { formatDateFR } from "@/lib/dates";
import { urlDuSite } from "@/lib/site";
import { lireModele } from "@/lib/modele-carte";
import { Card, btnPrimary, etatCarte } from "@/components/admin/ui";
import CartePrint from "@/components/carte/CartePrint";

export const dynamic = "force-dynamic";

export default async function CartePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [card, settings, modele] = await Promise.all([
    prisma.card.findUnique({ where: { token }, include: { agent: true } }),
    prisma.settings.findUnique({ where: { id: "main" } }),
    prisma.modeleCarte.findUnique({
      where: { id: "main" },
      select: { config: true, logoUrl: true, updatedAt: true },
    }),
  ]);

  if (!card) {
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas p-4">
        <Card className="max-w-sm text-center">
          <p className="text-sm font-semibold text-ink">Carte introuvable</p>
          <p className="mt-1 text-sm text-muted">
            Cette carte n’existe pas dans cette base de données.
          </p>
          <Link href="/admin/agents" className={`${btnPrimary} mt-5`}>
            Retour aux agents
          </Link>
        </Card>
      </div>
    );
  }

  const qr = await QRCode.toDataURL(`${await urlDuSite()}/v/${token}`, {
    width: 600,
    margin: 1,
    errorCorrectionLevel: "M",
  });
  const { agent } = card;
  const etat = etatCarte(card.statut, card.expireAt);

  return (
    <CartePrint
      retour={{ href: `/admin/cartes/${card.id}`, label: "Retour à la fiche" }}
      titre={`${agent.prenom} ${agent.nom}`}
      etat={etat}
      donnees={{
        prenom: agent.prenom,
        nom: agent.nom,
        matricule: agent.matricule,
        sexe: agent.sexe === "M" ? "Homme" : agent.sexe === "F" ? "Femme" : "—",
        fonction: agent.fonction,
        entreprise: settings?.nomOrganisation ?? "SecuriApp",
        emission: formatDateFR(card.issuedAt ?? card.createdAt),
        expiration: card.expireAt ? formatDateFR(card.expireAt) : "Illimitée",
        photoUrl: agent.photoUrl,
        qr,
      }}
      modeleInitial={lireModele(modele?.config)}
      nomInitial={settings?.nomOrganisation ?? "SecuriApp"}
      logoInitial={
        modele?.logoUrl
          ? `/api/modele-carte/logo?v=${new Date(modele.updatedAt).getTime()}`
          : null
      }
    />
  );
}