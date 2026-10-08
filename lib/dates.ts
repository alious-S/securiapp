/** "2027-10-05" -> fin de cette journée (la carte reste valable toute la journée) */
export function finDeJournee(valeur: unknown): Date | null {
  if (typeof valeur !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valeur)) {
    return null;
  }
  const d = new Date(`${valeur}T23:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateFR(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Africa/Bamako",
  });
}