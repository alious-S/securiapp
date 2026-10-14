/**
 * LA CARTE (recto et verso)
 * -------------------------
 * Dessine la carte à partir du modèle choisi par le client (lib/modele-carte.ts).
 * Toutes les positions sont en millimètres : la carte fait 85,6 × 54 mm (CR80).
 * Aucune logique ici : on affiche ce qu'on reçoit.
 */
import { COULEURS, type ModeleCarte } from "@/lib/modele-carte";

export type DonneesCarte = {
  prenom: string;
  nom: string;
  matricule: string;
  sexe: string;
  fonction: string;
  entreprise: string;
  emission: string;
  expiration: string;
  photoUrl: string | null;
  qr: string;
};

// Le texte rétrécit selon sa longueur pour ne jamais être coupé
const tNom = (s: string) =>
  s.length <= 12 ? 10 : s.length <= 16 ? 8.5 : s.length <= 20 ? 7.5 : 6.5;
const tPrenom = (s: string) => (s.length <= 16 ? 8 : s.length <= 22 ? 7 : 6.2);
const tTexte = (s: string) => (s.length <= 30 ? 7 : s.length <= 38 ? 6.2 : 5.6);
const tTitre = (s: string) => (s.length <= 22 ? 7 : s.length <= 30 ? 6 : 5.2);
const tDevise = (s: string) => (s.length <= 34 ? 4.2 : 3.6);
const tBandeau = (s: string, haut: boolean) =>
  haut
    ? s.length <= 18 ? 10 : s.length <= 26 ? 8.5 : 7
    : s.length <= 18 ? 6.6 : s.length <= 26 ? 5.8 : 5;

const FACE =
  "carte-face relative h-[53.98mm] w-[85.6mm] shrink-0 overflow-hidden rounded-[3.2mm] bg-white text-[#101a14] shadow-lg ring-1 ring-black/10 print:h-[53.9mm] print:rounded-none print:shadow-none print:ring-0";

const GRIS = "#7a857e";

function Champ({
  label,
  valeur,
  taille,
  style,
  majuscules,
}: {
  label: string;
  valeur: string;
  taille: number;
  style?: React.CSSProperties;
  majuscules?: boolean;
}) {
  return (
    <div style={{ minWidth: 0, ...style }}>
      <div
        style={{
          fontSize: "4pt",
          letterSpacing: "0.12em",
          color: GRIS,
          fontWeight: 600,
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        {label}
      </div>
      {/* Les marges internes évitent que les accents (É, Ï...) soient coupés */}
      <div
        style={{
          paddingTop: "0.5mm",
          paddingBottom: "0.3mm",
          marginBottom: "-0.3mm",
          fontSize: `${taille}pt`,
          fontWeight: 700,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textTransform: majuscules ? "uppercase" : undefined,
        }}
      >
        {valeur}
      </div>
    </div>
  );
}

/** Haut de la carte : logo ou drapeau, titre, armoiries, puis la bannière colorée */
function Entete({
  modele,
  entreprise,
  logoSrc,
  emblemeOk,
  onEmblemeIntrouvable,
}: {
  modele: ModeleCarte;
  entreprise: string;
  logoSrc: string | null;
  emblemeOk: boolean;
  onEmblemeIntrouvable: () => void;
}) {
  const c = COULEURS[modele.couleur];
  // "Mon logo" choisi mais pas encore chargé : on n'affiche rien plutôt qu'un trou
  const gauche =
    modele.enteteGauche === "logo" && !logoSrc ? "aucun" : modele.enteteGauche;
  const embleme = modele.embleme && emblemeOk;
  const aTexte = modele.titre !== "" || modele.devise !== "";
  const visible = gauche !== "aucun" || aTexte || embleme;

  const largeurGauche = gauche === "drapeau" ? 9 : gauche === "logo" ? 16 : 0;
  const texteGauche = gauche === "aucun" ? 4 : 4 + largeurGauche + 2;
  const texteDroite = embleme ? 16.5 : 4;

  // Sans en-tête, la bannière devient plus haute et occupe le haut de la carte
  const bandeauHaut = visible ? 11.4 : 0;
  const bandeauHauteur = visible ? 5.6 : 17;
  const decalage = (bandeauHauteur + 4) * 0.667;

  return (
    <>
      {gauche === "drapeau" && (
        <div
          style={{
            position: "absolute",
            left: "4mm",
            top: "2.4mm",
            width: "9mm",
            height: "6mm",
            display: "flex",
            borderRadius: "0.7mm",
            overflow: "hidden",
          }}
        >
          <span style={{ flex: 1, background: "#14b53a" }} />
          <span style={{ flex: 1, background: "#fcd116" }} />
          <span style={{ flex: 1, background: "#ce1126" }} />
        </div>
      )}

      {gauche === "logo" && logoSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc}
          alt=""
          style={{
            position: "absolute",
            left: "4mm",
            top: "1.2mm",
            width: "16mm",
            height: "9mm",
            objectFit: "contain",
            objectPosition: "left center",
          }}
        />
      )}

      {aTexte && (
        <div
          style={{
            position: "absolute",
            left: `${texteGauche}mm`,
            right: `${texteDroite}mm`,
            top: 0,
            height: "11.4mm",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {modele.titre !== "" && (
            <div
              style={{
                paddingTop: "0.5mm",
                fontSize: `${tTitre(modele.titre)}pt`,
                fontWeight: 800,
                letterSpacing: "0.07em",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {modele.titre}
            </div>
          )}
          {modele.devise !== "" && (
            <div
              style={{
                paddingTop: modele.titre !== "" ? "0.3mm" : 0,
                paddingBottom: "0.3mm",
                fontSize: `${tDevise(modele.devise)}pt`,
                letterSpacing: "0.14em",
                color: GRIS,
                fontWeight: 600,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {modele.devise}
            </div>
          )}
        </div>
      )}

      {embleme && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo-mali.png"
          alt=""
          onError={onEmblemeIntrouvable}
          ref={(el) => {
            if (el && el.complete && el.naturalWidth === 0) onEmblemeIntrouvable();
          }}
          style={{
            position: "absolute",
            right: "4mm",
            top: "1.6mm",
            width: "9mm",
            height: "9mm",
            objectFit: "contain",
          }}
        />
      )}

      {/* Bannière : nom de l'entreprise */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${bandeauHaut}mm`,
          height: `${bandeauHauteur}mm`,
          background: `linear-gradient(90deg, ${c.fonce}, ${c.moyen})`,
          overflow: "hidden",
        }}
      >
        <svg
          viewBox={`0 0 85.6 ${bandeauHauteur}`}
          preserveAspectRatio="none"
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <line x1="64" y1="-2" x2={64 - decalage} y2={bandeauHauteur + 2} stroke={c.clair} strokeWidth="2.4" />
          <line x1="72" y1="-2" x2={72 - decalage} y2={bandeauHauteur + 2} stroke={c.clair} strokeWidth="0.8" />
        </svg>
        <div
          style={{
            position: "absolute",
            left: "4mm",
            right: "4mm",
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "3mm",
            color: "#fff",
          }}
        >
          <span
            style={{
              minWidth: 0,
              padding: "0.5mm 0",
              fontSize: `${tBandeau(entreprise, !visible)}pt`,
              fontWeight: 800,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {entreprise}
          </span>
          {modele.sousTitre !== "" && (
            <span
              style={{
                flex: "none",
                fontSize: "4.5pt",
                fontWeight: 700,
                letterSpacing: "0.16em",
              }}
            >
              {modele.sousTitre}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default function CarteVisuelle({
  face,
  modele,
  donnees: d,
  logoSrc,
  emblemeOk,
  onEmblemeIntrouvable,
  className,
}: {
  face: "recto" | "verso";
  modele: ModeleCarte;
  donnees: DonneesCarte;
  logoSrc: string | null;
  emblemeOk: boolean;
  onEmblemeIntrouvable: () => void;
  className?: string;
}) {
  const c = COULEURS[modele.couleur];
  const ch = modele.champs;

  return (
    <div className={`${FACE} ${className ?? ""}`}>
      <Entete
        modele={modele}
        entreprise={d.entreprise}
        logoSrc={logoSrc}
        emblemeOk={emblemeOk}
        onEmblemeIntrouvable={onEmblemeIntrouvable}
      />

      {face === "recto" ? (
        <>
          {/* Photo : plus grande quand le matricule est masqué */}
          <div
            style={{
              position: "absolute",
              left: "4mm",
              top: "19.6mm",
              width: "22mm",
              height: ch.matricule ? "26.5mm" : "31mm",
              borderRadius: "1.6mm",
              overflow: "hidden",
              border: `0.45mm solid ${c.moyen}`,
              background: c.teinte,
            }}
          >
            {d.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={d.photoUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "100%",
                  height: "100%",
                  fontSize: "18pt",
                  fontWeight: 700,
                  color: c.fonce,
                }}
              >
                {d.prenom[0]}
                {d.nom[0]}
              </div>
            )}
          </div>

          {ch.matricule && (
            <div
              style={{
                position: "absolute",
                left: "4mm",
                top: "47.3mm",
                width: "22mm",
                height: "4.2mm",
                borderRadius: "999px",
                background: c.teinte,
                color: c.fonce,
                fontSize: "7pt",
                fontWeight: 800,
                display: "grid",
                placeItems: "center",
                lineHeight: 1,
              }}
            >
              {d.matricule}
            </div>
          )}

          <div
            style={{
              position: "absolute",
              left: "29.5mm",
              top: "19.4mm",
              width: "52.5mm",
              display: "flex",
              flexDirection: "column",
              gap: "1.3mm",
            }}
          >
            <Champ label="Nom" valeur={d.nom} taille={tNom(d.nom)} majuscules />
            <div style={{ display: "flex", gap: "2mm" }}>
              <Champ
                label="Prénom"
                valeur={d.prenom}
                taille={tPrenom(d.prenom)}
                style={{ flex: 1 }}
              />
              {ch.sexe && (
                <Champ
                  label="Sexe"
                  valeur={d.sexe}
                  taille={7}
                  style={{ width: "12mm", flex: "none" }}
                />
              )}
            </div>
            {ch.fonction && (
              <Champ label="Fonction" valeur={d.fonction} taille={tTexte(d.fonction)} />
            )}
            {ch.entreprise && (
              <Champ label="Entreprise" valeur={d.entreprise} taille={tTexte(d.entreprise)} />
            )}
            {(ch.emission || ch.expiration) && (
              <div style={{ display: "flex", gap: "2mm" }}>
                {ch.emission && (
                  <Champ label="Émission" valeur={d.emission} taille={7} style={{ flex: 1 }} />
                )}
                {ch.expiration && (
                  <Champ label="Expiration" valeur={d.expiration} taille={7} style={{ flex: 1 }} />
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              left: "5mm",
              top: "20mm",
              width: "30mm",
              height: "30mm",
              background: "#fff",
              borderRadius: "2mm",
              padding: "1.1mm",
              boxShadow: `0 0 0 0.25mm ${c.teinte}, 0 0.6mm 1.6mm rgba(0,0,0,0.18)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={d.qr}
              alt="QR code"
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: "40mm",
              top: "20.6mm",
              width: "41.5mm",
            }}
          >
            <div
              style={{
                fontSize: "4.2pt",
                letterSpacing: "0.2em",
                fontWeight: 700,
                color: c.moyen,
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Vérification
            </div>
            <div
              style={{
                marginTop: "1.1mm",
                fontSize: "9pt",
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              Scannez pour vérifier
            </div>
            <div
              style={{
                marginTop: "1.4mm",
                fontSize: "5.4pt",
                lineHeight: 1.4,
                color: "#4a564f",
              }}
            >
              Avec l’appareil photo de votre téléphone, confirmez l’identité de
              l’agent.
            </div>
            <div
              style={{
                marginTop: "1.4mm",
                fontSize: "5pt",
                fontWeight: 700,
                lineHeight: 1.3,
                color: "#b42318",
              }}
            >
              Carte « invalide » = ne pas l’accepter.
            </div>
            {d.entreprise !== "" && (
              <div
                style={{
                  marginTop: "2.6mm",
                  borderTop: "0.2mm solid #e5e8e3",
                  paddingTop: "1.3mm",
                }}
              >
                <Champ label="Délivrée par" valeur={d.entreprise} taille={6.6} />
              </div>
            )}
          </div>
        </>
      )}

      {/* Bande de couleur en bas de la carte */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "1.6mm",
          background: `linear-gradient(90deg, ${c.fonce}, ${c.clair})`,
        }}
      />
    </div>
  );
}