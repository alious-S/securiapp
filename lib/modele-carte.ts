/**
 * MODÈLE DE CARTE : tout ce que le client peut personnaliser
 * -----------------------------------------------------------
 * Les réglages sont enregistrés une fois en base et utilisés pour TOUTES
 * les impressions. Pour ajouter une option : l'ajouter ici (type + valeur par
 * défaut + lireModele), puis dans l'éditeur (components/carte/CartePrint.tsx)
 * et dans la carte (components/carte/CarteVisuelle.tsx).
 */

export type EnteteGauche = "drapeau" | "logo" | "aucun";
export type CouleurId = "vert" | "bleu" | "anthracite" | "bordeaux" | "orange";

export type ChampsCarte = {
  matricule: boolean;
  sexe: boolean;
  fonction: boolean;
  entreprise: boolean;
  emission: boolean;
  expiration: boolean;
};

export type ModeleCarte = {
  enteteGauche: EnteteGauche; // ce qui s'affiche en haut à gauche
  titre: string; // ex : RÉPUBLIQUE DU MALI (vide = masqué)
  devise: string; // ex : UN PEUPLE – UN BUT – UNE FOI (vide = masquée)
  embleme: boolean; // armoiries du Mali (fichier public/logo-mali.png)
  sousTitre: string; // texte à droite de la bannière (vide = masqué)
  couleur: CouleurId;
  champs: ChampsCarte;
};

export const MODELE_PAR_DEFAUT: ModeleCarte = {
  enteteGauche: "drapeau",
  titre: "RÉPUBLIQUE DU MALI",
  devise: "UN PEUPLE – UN BUT – UNE FOI",
  embleme: true,
  sousTitre: "CARTE PROFESSIONNELLE",
  couleur: "vert",
  champs: {
    matricule: true,
    sexe: true,
    fonction: true,
    entreprise: true,
    emission: true,
    expiration: true,
  },
};

/** Les 5 couleurs proposées : foncé, moyen, clair, teinte très pâle */
export const COULEURS: Record<
  CouleurId,
  { nom: string; fonce: string; moyen: string; clair: string; teinte: string }
> = {
  vert: { nom: "Vert", fonce: "#11512f", moyen: "#1f8359", clair: "#55b98a", teinte: "#eef7f1" },
  bleu: { nom: "Bleu", fonce: "#12365f", moyen: "#1d5fa8", clair: "#6aa6e0", teinte: "#eaf2fb" },
  anthracite: { nom: "Anthracite", fonce: "#1f2933", moyen: "#3e4c59", clair: "#9aa5b1", teinte: "#eef0f2" },
  bordeaux: { nom: "Bordeaux", fonce: "#6b1d2b", moyen: "#a1334a", clair: "#e08a9b", teinte: "#fbeef0" },
  orange: { nom: "Orange", fonce: "#7a3a0a", moyen: "#c25a10", clair: "#f2a65a", teinte: "#fdf3e8" },
};

export const COULEUR_IDS = Object.keys(COULEURS) as CouleurId[];
const ENTETES: readonly EnteteGauche[] = ["drapeau", "logo", "aucun"];

// ---- Petites fonctions de nettoyage (tout ce qui vient du navigateur passe par là) ----

function texte(valeur: unknown, defaut: string, max: number) {
  return typeof valeur === "string"
    ? valeur.trim().replace(/\s+/g, " ").slice(0, max)
    : defaut; // une chaîne vide est valable : elle masque l'élément
}

function oui(valeur: unknown, defaut: boolean) {
  return typeof valeur === "boolean" ? valeur : defaut;
}

function objet(valeur: unknown): Record<string, unknown> {
  return valeur && typeof valeur === "object" && !Array.isArray(valeur)
    ? (valeur as Record<string, unknown>)
    : {};
}

/**
 * Transforme n'importe quelle donnée en un modèle valide.
 * Valeur absente ou incorrecte = valeur par défaut. Ne plante jamais.
 */
export function lireModele(brut: unknown): ModeleCarte {
  const b = objet(brut);
  const c = objet(b.champs);
  const d = MODELE_PAR_DEFAUT;

  return {
    enteteGauche: ENTETES.find((x) => x === b.enteteGauche) ?? d.enteteGauche,
    titre: texte(b.titre, d.titre, 40),
    devise: texte(b.devise, d.devise, 50),
    embleme: oui(b.embleme, d.embleme),
    sousTitre: texte(b.sousTitre, d.sousTitre, 30),
    couleur: COULEUR_IDS.find((x) => x === b.couleur) ?? d.couleur,
    champs: {
      matricule: oui(c.matricule, d.champs.matricule),
      sexe: oui(c.sexe, d.champs.sexe),
      fonction: oui(c.fonction, d.champs.fonction),
      entreprise: oui(c.entreprise, d.champs.entreprise),
      emission: oui(c.emission, d.champs.emission),
      expiration: oui(c.expiration, d.champs.expiration),
    },
  };
}

/** Un logo valide : vraie image (png, jpeg, webp) de 400 000 caractères maximum. */
export function logoValide(valeur: unknown): valeur is string {
  return (
    typeof valeur === "string" &&
    valeur.length <= 400_000 &&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(valeur)
  );
}