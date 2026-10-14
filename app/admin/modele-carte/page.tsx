/** "MA CARTE" : l'endroit où le client règle l'apparence de toutes ses cartes. */
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { formatDateFR } from "@/lib/dates";
import { urlDuSite } from "@/lib/site";
import { lireModele } from "@/lib/modele-carte";
import CartePrint from "@/components/carte/CartePrint";

export const dynamic = "force-dynamic";

export default async function MaCartePage() {
  const [settings, modele] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "main" } }),
    prisma.modeleCarte.findUnique({
      where: { id: "main" },
      select: { config: true, logoUrl: true, updatedAt: true },
    }),
  ]);

  // Le QR de l'exemple pointe vers l'accueil du site (il ne crée aucun faux contrôle)
  const qr = await QRCode.toDataURL(await urlDuSite(), {
    width: 600,
    margin: 1,
    errorCorrectionLevel: "M",
  });
  const dansUnAn = new Date();
  dansUnAn.setFullYear(dansUnAn.getFullYear() + 1);
  const nom = settings?.nomOrganisation ?? "SecuriApp";

  return (
    <CartePrint
      exemple
      donnees={{
        prenom: "Aly Mohamed",
        nom: "Soumare",
        matricule: "AG-01",
        sexe: "Homme",
        fonction: "Agent de sécurité",
        entreprise: nom,
        emission: formatDateFR(new Date()),
        expiration: formatDateFR(dansUnAn),
        photoUrl: null,
        qr,
      }}
      modeleInitial={lireModele(modele?.config)}
      nomInitial={nom}
      logoInitial={
        modele?.logoUrl
          ? `/api/modele-carte/logo?v=${new Date(modele.updatedAt).getTime()}`
          : null
      }
    />
  );
}