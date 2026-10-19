/**
 * DONNÉES DES PAGES (chargées côté serveur)
 * ------------------------------------------
 * Toutes les questions posées à la base de données par les pages de
 * l'administration sont ici. Les pages arrivent donc déjà remplies : pas
 * d'attente après l'ouverture. Pour changer un chiffre ou une liste affichée,
 * c'est dans ce fichier.
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { lireModele, type ModeleCarte } from "@/lib/modele-carte";

const UN_JOUR = 86_400_000;

/** Exécute une requête ; si elle échoue (ex : table pas encore créée), renvoie null. */
async function sansErreur<T>(requete: () => Promise<T>): Promise<T | null> {
  try {
    return await requete();
  } catch (erreur) {
    console.error(erreur);
    return null;
  }
}

// ───────────── Entreprise et modèle de carte ─────────────

/**
 * Nom, modèle de carte et logo de l'entreprise. Ne plante jamais : si la table
 * du modèle n'existe pas encore, on renvoie le modèle d'origine.
 */
export async function chargerModele() {
  const [settings, modele] = await Promise.all([
    sansErreur(() => prisma.settings.findUnique({ where: { id: "main" } })),
    sansErreur(() =>
      prisma.modeleCarte.findUnique({
        where: { id: "main" },
        select: { config: true, logoUrl: true, updatedAt: true },
      })
    ),
  ]);
  const version = modele?.updatedAt ? new Date(modele.updatedAt).getTime() : 0;
  return {
    nomOrganisation: settings?.nomOrganisation ?? "SecuriApp",
    dureeValiditeJours: settings?.dureeValiditeJours ?? 365,
    config: lireModele(modele?.config) as ModeleCarte,
    logoSrc: modele?.logoUrl ? `/api/modele-carte/logo?v=${version}` : null,
    version,
  };
}

// ───────────── Accueil ─────────────

export async function chargerAccueil() {
  const maintenant = new Date();
  const debutJour = new Date(maintenant);
  debutJour.setHours(0, 0, 0, 0);
  const dans30Jours = new Date(maintenant.getTime() + 30 * UN_JOUR);

  // À renouveler = carte active, agent sur le terrain, expirée ou qui expire sous 30 jours
  const aRenouveler: Prisma.CardWhereInput = {
    statut: "actif",
    agent: { actif: true },
    expireAt: { lt: dans30Jours },
  };

  const [
    agentsTotal,
    agentsActifs,
    expirees,
    bientot,
    controlesAujourdhui,
    refusesAujourdhui,
    aTraiter,
    derniers,
  ] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.count({ where: { actif: true } }),
    prisma.card.count({ where: { ...aRenouveler, expireAt: { lt: maintenant } } }),
    prisma.card.count({
      where: { ...aRenouveler, expireAt: { gte: maintenant, lt: dans30Jours } },
    }),
    prisma.verificationLog.count({ where: { scannedAt: { gte: debutJour } } }),
    prisma.verificationLog.count({
      where: { scannedAt: { gte: debutJour }, resultat: "invalide" },
    }),
    prisma.card.findMany({
      where: aRenouveler,
      orderBy: { expireAt: "asc" },
      take: 5,
      select: {
        id: true,
        expireAt: true,
        agent: { select: { id: true, nom: true, prenom: true } },
      },
    }),
    prisma.verificationLog.findMany({
      orderBy: { scannedAt: "desc" },
      take: 5,
      select: {
        id: true,
        resultat: true,
        scannedAt: true,
        card: { select: { agent: { select: { nom: true, prenom: true } } } },
      },
    }),
  ]);

  return {
    agents: {
      total: agentsTotal,
      actifs: agentsActifs,
      inactifs: agentsTotal - agentsActifs,
    },
    cartes: { expirees, bientot },
    controles: { aujourdhui: controlesAujourdhui, refuses: refusesAujourdhui },
    aTraiter: aTraiter.map((c) => ({
      id: c.id,
      expireAt: c.expireAt as Date,
      agentId: c.agent.id,
      nom: c.agent.nom,
      prenom: c.agent.prenom,
    })),
    derniers: derniers.map((l) => ({
      id: l.id,
      accepte: l.resultat === "valide",
      scannedAt: l.scannedAt,
      nom: l.card?.agent.nom ?? null,
      prenom: l.card?.agent.prenom ?? null,
    })),
  };
}

// ───────────── Agents ─────────────

/** La liste des agents, SANS leur photo (trop lourde) : elle est chargée à part. */
export async function listerAgents() {
  const agents = await prisma.agent.findMany({
    omit: { photoUrl: true },
    include: {
      cards: { select: { id: true, token: true, statut: true, expireAt: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return agents.map((a) => ({
    id: a.id,
    nom: a.nom,
    prenom: a.prenom,
    matricule: a.matricule,
    fonction: a.fonction,
    actif: a.actif,
    cards: a.cards.map((c) => ({
      id: c.id,
      token: c.token,
      statut: c.statut,
      expireAt: c.expireAt ? new Date(c.expireAt).toISOString() : null,
    })),
  }));
}

/** La fiche d'une carte et de son agent (sans la photo). */
export async function chargerCarte(id: string) {
  return prisma.card.findUnique({
    where: { id },
    select: {
      id: true,
      token: true,
      statut: true,
      expireAt: true,
      issuedAt: true,
      createdAt: true,
      agent: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          matricule: true,
          agence: true,
          fonction: true,
          sexe: true,
          actif: true,
        },
      },
      logs: {
        orderBy: { scannedAt: "desc" },
        take: 6,
        select: { id: true, resultat: true, scannedAt: true },
      },
    },
  });
}

// ───────────── Contrôles ─────────────

export const PERIODES = ["jour", "semaine", "mois", "tout"] as const;
export const RESULTATS = ["tous", "refuses"] as const;
export type Periode = (typeof PERIODES)[number];
export type Resultat = (typeof RESULTATS)[number];

export async function chargerControles(periode: Periode, resultat: Resultat) {
  const maintenant = new Date();
  let depuis: Date | undefined;
  if (periode === "jour") {
    depuis = new Date(maintenant);
    depuis.setHours(0, 0, 0, 0);
  } else if (periode === "semaine") {
    depuis = new Date(maintenant.getTime() - 7 * UN_JOUR);
  } else if (periode === "mois") {
    depuis = new Date(maintenant.getTime() - 30 * UN_JOUR);
  }

  const logs = await prisma.verificationLog.findMany({
    where: {
      ...(depuis ? { scannedAt: { gte: depuis } } : {}),
      ...(resultat === "refuses" ? { resultat: "invalide" } : {}),
    },
    select: {
      id: true,
      resultat: true,
      scannedAt: true,
      card: { select: { id: true, agent: { select: { nom: true, prenom: true, matricule: true } } } },
    },
    orderBy: { scannedAt: "desc" },
    take: 100,
  });

  return logs.map((l) => ({
    id: l.id,
    accepte: l.resultat === "valide",
    scannedAt: l.scannedAt,
    cardId: l.card?.id ?? null,
    nom: l.card?.agent.nom ?? null,
    prenom: l.card?.agent.prenom ?? null,
    matricule: l.card?.agent.matricule ?? null,
  }));
}

// ───────────── Alertes ─────────────

const CARTE_RESUMEE = {
  id: true,
  statut: true,
  expireAt: true,
  agent: { select: { nom: true, prenom: true, matricule: true } },
} satisfies Prisma.CardSelect;

/**
 * Activités suspectes des dernières 24 heures :
 *  - cartes retirées ou en pause présentées à un contrôle
 *  - cartes scannées plus de 5 fois en 1 heure (carte peut-être copiée)
 *  - cartes inexistantes scannées (quelqu'un devine des codes)
 */
export async function chargerAlertes() {
  const maintenant = Date.now();
  const uneHeure = new Date(maintenant - 3_600_000);
  const vingtQuatreHeures = new Date(maintenant - UN_JOUR);

  const [logsBloques, scansRecents, inconnues] = await Promise.all([
    prisma.verificationLog.findMany({
      where: {
        scannedAt: { gte: vingtQuatreHeures },
        resultat: "invalide",
        card: { statut: { in: ["revoque", "desactive"] } },
      },
      select: { id: true, scannedAt: true, card: { select: CARTE_RESUMEE } },
      orderBy: { scannedAt: "desc" },
      take: 30,
    }),
    prisma.verificationLog.findMany({
      where: { scannedAt: { gte: uneHeure }, resultat: "valide", cardId: { not: null } },
      select: { cardId: true },
    }),
    prisma.verificationLog.count({
      where: { scannedAt: { gte: vingtQuatreHeures }, resultat: "invalide", cardId: null },
    }),
  ]);

  // Combien de scans par carte sur la dernière heure ?
  const parCarte = new Map<string, number>();
  for (const scan of scansRecents) {
    if (scan.cardId) parCarte.set(scan.cardId, (parCarte.get(scan.cardId) ?? 0) + 1);
  }
  const suspects = [...parCarte.entries()].filter(([, n]) => n > 5).map(([id]) => id);
  const cartesSuspectes = suspects.length
    ? await prisma.card.findMany({ where: { id: { in: suspects } }, select: CARTE_RESUMEE })
    : [];

  return {
    bloquees: logsBloques.flatMap((l) =>
      l.card ? [{ id: l.id, scannedAt: l.scannedAt, card: l.card }] : []
    ),
    frequentes: cartesSuspectes.map((card) => ({ nombre: parCarte.get(card.id) ?? 0, card })),
    inconnues,
  };
}

/** Le nombre d'alertes (pastille du menu). Ne plante jamais. */
export async function compterAlertes() {
  const a = await sansErreur(chargerAlertes);
  if (!a) return 0;
  return a.bloquees.length + a.frequentes.length + (a.inconnues > 10 ? 1 : 0);
}