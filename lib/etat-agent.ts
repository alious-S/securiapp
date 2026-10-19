/**
 * ÉTAT D'UN AGENT, DIT EN MOTS SIMPLES
 * -------------------------------------
 * Une seule règle pour tout le site (liste, fiche...). Même ordre de priorité
 * qu'au moment du contrôle : carte retirée > hors service > en pause > expirée.
 */

export type Ton = "green" | "amber" | "rose" | "slate";

export type EtatAgent = {
  label: string;
  tone: Ton;
  aSurveiller: boolean; // carte expirée ou qui expire sous 30 jours
  horsService: boolean;
};

export function etatAgent(
  actif: boolean,
  carte: { statut: string; expireAt: string | Date | null } | null | undefined,
  maintenant: Date = new Date()
): EtatAgent {
  const base = { aSurveiller: false, horsService: false };
  if (!carte) return { ...base, label: "Sans carte", tone: "slate" };
  if (carte.statut === "revoque") return { ...base, label: "Carte retirée", tone: "rose" };
  if (!actif) return { ...base, horsService: true, label: "Hors service", tone: "amber" };
  if (carte.statut === "desactive") return { ...base, label: "En pause", tone: "slate" };

  if (carte.expireAt) {
    const reste = new Date(carte.expireAt).getTime() - maintenant.getTime();
    if (reste < 0) return { ...base, aSurveiller: true, label: "Carte expirée", tone: "rose" };
    if (reste < 30 * 86_400_000)
      return { ...base, aSurveiller: true, label: "Expire bientôt", tone: "amber" };
  }
  return { ...base, label: "À jour", tone: "green" };
}