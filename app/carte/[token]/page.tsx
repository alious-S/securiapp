/** IMPRESSION D'UNE CARTE (chargée côté serveur). Le modèle choisi par le client est appliqué. */
import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { formatDateFR } from "@/lib/dates";
import { urlDuSite } from "@/lib/site";
import { chargerModele } from "@/lib/donnees";
import { Card, btnPrimary, etatCarte } from "@/components/admin/ui";
import CartePrint from "@/components/carte/CartePrint";

export const dynamic = "force-dynamic";

export default async function CartePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const [card, modele] = await Promise.all([
    prisma.card.findUnique({ where: { token }, include: { agent: true } }),
    chargerModele(),
  ]);

  if (!card) {
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas p-4">
        <Card className="max-w-sm text-center">
          <p className="text-sm font-semibold text-ink">Carte introuvable</p>
          <p className="mt-1 text-sm text-muted">Cette carte n’existe pas dans cette base de données.</p>
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

  return (
    <CartePrint
      retour={{ href: `/admin/cartes/${card.id}`, label: "Retour à la fiche" }}
      titre={`${agent.prenom} ${agent.nom}`}
      etat={etatCarte(card.statut, card.expireAt)}
      donnees={{
        prenom: agent.prenom,
        nom: agent.nom,
        matricule: agent.matricule,
        sexe: agent.sexe === "M" ? "Homme" : agent.sexe === "F" ? "Femme" : "—",
        fonction: agent.fonction,
        entreprise: modele.nomOrganisation,
        emission: formatDateFR(card.issuedAt ?? card.createdAt),
        expiration: card.expireAt ? formatDateFR(card.expireAt) : "Illimitée",
        photoUrl: agent.photoUrl,
        qr,
      }}
      modeleInitial={modele.config}
      nomInitial={modele.nomOrganisation}
      logoInitial={modele.logoSrc}
    />
  );
}