"use client";

import { useEffect, useState } from "react";
import { ScanLine, ShieldCheck, ShieldX } from "lucide-react";
import {
  Card,
  EmptyState,
  ListSkeleton,
  PageHeader,
  Pill,
  chip,
  formatDate,
  formatTime,
} from "@/components/admin/ui";

type Log = {
  id: string;
  resultat: string;
  scannedAt: string;
  ipAddress: string | null;
  card: { agent: { nom: string; prenom: string; matricule: string } } | null;
};

const periodes = [
  { value: "tous", label: "Tout" },
  { value: "aujourdhui", label: "Aujourd’hui" },
  { value: "semaine", label: "Cette semaine" },
  { value: "mois", label: "Ce mois" },
];

const resultats = [
  { value: "tous", label: "Tous" },
  { value: "valide", label: "Valides" },
  { value: "invalide", label: "Invalides" },
];

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-semibold tracking-tight ${accent}`}>
        {value}
      </p>
    </Card>
  );
}

export default function VerificationsPage() {
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [error, setError] = useState(false);
  const [periode, setPeriode] = useState("tous");
  const [resultat, setResultat] = useState("tous");

  useEffect(() => {
    let annule = false;
    const sp = new URLSearchParams({ periode, resultat });
    fetch(`/api/verifications?${sp.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (!annule) {
          setLogs(data);
          setError(false);
        }
      })
      .catch(() => {
        if (!annule) setError(true);
      });
    return () => {
      annule = true;
    };
  }, [periode, resultat]);

  const valides = logs?.filter((l) => l.resultat === "valide").length ?? 0;
  const invalides = (logs?.length ?? 0) - valides;

  return (
    <>
      <PageHeader
        title="Vérifications"
        subtitle="Historique de tous les scans effectués sur les cartes."
      />

      <div className="mb-4 grid grid-cols-3 gap-3 sm:gap-4">
        <MiniStat label="Scans" value={logs?.length ?? 0} accent="text-ink" />
        <MiniStat label="Valides" value={valides} accent="text-brand-700" />
        <MiniStat label="Invalides" value={invalides} accent="text-rose-600" />
      </div>

      <Card className="mb-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-muted">Période</p>
            <div className="flex flex-wrap gap-1.5">
              {periodes.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriode(p.value)}
                  className={chip(periode === p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted">Résultat</p>
            <div className="flex flex-wrap gap-1.5">
              {resultats.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setResultat(r.value)}
                  className={chip(resultat === r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="py-10 text-center text-sm text-muted">
          Impossible de charger l’historique.
        </Card>
      ) : logs === null ? (
        <ListSkeleton />
      ) : (
        <Card className="p-2 sm:p-3">
          {logs.length === 0 ? (
            <EmptyState
              icon={<ScanLine className="size-6" />}
              title="Aucune vérification"
              text="Aucun scan ne correspond à ces filtres."
            />
          ) : (
            <ul className="divide-y divide-line/70">
              {logs.map((l) => {
                const ok = l.resultat === "valide";
                return (
                  <li key={l.id} className="flex items-center gap-3 px-3 py-3 sm:gap-4">
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-full ${
                        ok
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {ok ? (
                        <ShieldCheck className="size-5" />
                      ) : (
                        <ShieldX className="size-5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {l.card
                          ? `${l.card.agent.prenom} ${l.card.agent.nom}`
                          : "Carte inconnue"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {l.card ? l.card.agent.matricule : "Jeton inexistant"}
                        {l.ipAddress && (
                          <span className="hidden md:inline">
                            {" "}
                            · IP {l.ipAddress.split(",")[0]}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs font-medium text-ink">
                        {formatDate(l.scannedAt)}
                      </p>
                      <p className="text-xs text-muted">{formatTime(l.scannedAt)}</p>
                    </div>
                    <Pill tone={ok ? "green" : "rose"}>{ok ? "Valide" : "Invalide"}</Pill>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </>
  );
}