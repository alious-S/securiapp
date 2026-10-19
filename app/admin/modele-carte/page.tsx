/** "MA CARTE" : l'endroit où le client règle l'apparence de toutes ses cartes. */
import QRCode from "qrcode";
import { formatDateFR } from "@/lib/dates";
import { urlDuSite } from "@/lib/site";
import { chargerModele } from "@/lib/donnees";
import CartePrint from "@/components/carte/CartePrint";

export const dynamic = "force-dynamic";

export default async function MaCartePage() {
  const modele = await chargerModele();

  // Le QR de l'exemple pointe vers l'accueil du site (il ne crée aucun faux contrôle)
  const qr = await QRCode.toDataURL(await urlDuSite(), { width: 600, margin: 1, errorCorrectionLevel: "M" });
  const dansUnAn = new Date();
  dansUnAn.setFullYear(dansUnAn.getFullYear() + 1);

  return (
    <CartePrint
      exemple
      donnees={{
        prenom: "Aly Mohamed",
        nom: "Soumare",
        matricule: "AG-01",
        sexe: "Homme",
        fonction: "Agent de sécurité",
        entreprise: modele.nomOrganisation,
        emission: formatDateFR(new Date()),
        expiration: formatDateFR(dansUnAn),
        photoUrl: null,
        qr,
      }}
      modeleInitial={modele.config}
      nomInitial={modele.nomOrganisation}
      logoInitial={modele.logoSrc}
    />
  );
}