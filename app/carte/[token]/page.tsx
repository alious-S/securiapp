import { headers } from "next/headers";
import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { formatDateFR } from "@/lib/dates";
import { Card, btnPrimary, etatCarte } from "@/components/admin/ui";
import CartePrint from "./CartePrint";

export const dynamic = "force-dynamic";

/** Adresse publique encodée dans le QR code. */
async function baseUrl() {
  const fixe = process.env.NEXT_PUBLIC_SITE_URL;
  if (fixe) return fixe.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function CartePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const card = await prisma.card.findUnique({
    where: { token },
    include: { agent: true },
  });

  if (!card) {
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas p-4">
        <Card className="max-w-sm text-center">
          <p className="text-sm font-semibold text-ink">Carte introuvable</p>
          <p className="mt-1 text-sm text-muted">
            Cette carte n’existe pas dans cette base de données.
          </p>
          <Link href="/admin/cartes" className={`${btnPrimary} mt-5`}>
            Retour aux cartes
          </Link>
        </Card>
      </div>
    );
  }

  const settings = await prisma.settings.findUnique({ where: { id: "main" } });
  const qr = await QRCode.toDataURL(`${await baseUrl()}/v/${token}`, {
    width: 600,
    margin: 1,
    errorCorrectionLevel: "M",
  });
  const etat = etatCarte(card.statut, card.expireAt);
  const { agent } = card;

  return (
    <CartePrint
      cardId={card.id}
      prenom={agent.prenom}
      nom={agent.nom}
      matricule={agent.matricule}
      sexe={agent.sexe === "M" ? "Homme" : agent.sexe === "F" ? "Femme" : "—"}
      fonction={agent.fonction}
      entreprise={settings?.nomOrganisation ?? "SecuriApp"}
      emission={formatDateFR(card.issuedAt ?? card.createdAt)}
      expiration={card.expireAt ? formatDateFR(card.expireAt) : "Illimitée"}
      photoUrl={agent.photoUrl}
      qr={qr}
      etatLabel={etat.label}
      etatTone={etat.tone}
    />
  );
}