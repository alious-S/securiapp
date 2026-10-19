/**
 * CONTRÔLES : tous les scans de cartes, du plus récent au plus ancien.
 * Les filtres sont de simples liens : la page se charge côté serveur, sans attente.
 */
import Link from "next/link";
import { ScanLine, ShieldCheck, ShieldX } from "lucide-react";
import { Card, EmptyState, PageHeader, Pill, chip, cn, formatDate, formatTime } from "@/components/admin/ui";
import { PERIODES, RESULTATS, chargerControles, type Periode, type Resultat } from "@/lib/donnees";

export const dynamic = "force-dynamic";

const LIBELLES_PERIODE: Record<Periode, string> = {
  jour: "Aujourd’hui",
  semaine: "7 jours",
  mois: "30 jours",
  tout: "Tout",
};
const LIBELLES_RESULTAT: Record<Resultat, string> = { tous: "Tous", refuses: "Refusés seulement" };

export default async function ControlesPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string; resultat?: string }>;
}) {
  const q = await searchParams;
  const periode = PERIODES.find((p) => p === q.periode) ?? "semaine";
  const resultat = RESULTATS.find((r) => r === q.resultat) ?? "tous";
  const controles = await chargerControles(periode, resultat);

  const refuses = controles.filter((c) => !c.accepte).length;
  const lien = (p: Periode, r: Resultat) => `/admin/verifications?periode=${p}&resultat=${r}`;

  return (
    <>
      <PageHeader
        title="Contrôles"
        subtitle={
          controles.length === 0
            ? "Aucun contrôle sur cette période."
            : `${controles.length} ${controles.length > 1 ? "contrôles" : "contrôle"}${refuses > 0 && resultat === "tous" ? ` · ${refuses} refusé${refuses > 1 ? "s" : ""}` : ""}`
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {PERIODES.map((p) => (
            <Link key={p} href={lien(p, resultat)} className={chip(periode === p)}>
              {LIBELLES_PERIODE[p]}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RESULTATS.map((r) => (
            <Link key={r} href={lien(periode, r)} className={chip(resultat === r)}>
              {LIBELLES_RESULTAT[r]}
            </Link>
          ))}
        </div>
      </div>

      <Card className="p-2 sm:p-3">
        {controles.length === 0 ? (
          <EmptyState
            icon={<ScanLine className="size-6" />}
            title="Aucun contrôle"
            text="Dès que quelqu’un scanne une carte, vous le verrez ici."
          />
        ) : (
          <ul className="divide-y divide-line/70">
            {controles.map((c) => {
              const ligne = (
                <>
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-full",
                      c.accepte ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                    )}
                  >
                    {c.accepte ? <ShieldCheck className="size-5" /> : <ShieldX className="size-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {c.prenom ? `${c.prenom} ${c.nom}` : "Carte inconnue"}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {c.matricule ? `${c.matricule} · ` : ""}
                      {formatDate(c.scannedAt)} à {formatTime(c.scannedAt)}
                    </p>
                  </div>
                  <Pill tone={c.accepte ? "green" : "rose"}>{c.accepte ? "Acceptée" : "Refusée"}</Pill>
                </>
              );
              return (
                <li key={c.id}>
                  {c.cardId ? (
                    <Link href={`/admin/cartes/${c.cardId}`} className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-brand-50/60">
                      {ligne}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 px-3 py-3">{ligne}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
