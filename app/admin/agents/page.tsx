"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Users } from "lucide-react";
import {
  Avatar,
  Card,
  EmptyState,
  ListSkeleton,
  PageHeader,
  Pill,
  SearchField,
  btnPrimary,
  chip,
  cn,
} from "@/components/admin/ui";

type Agent = {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  agence: string;
  actif: boolean;
  photoUrl: string | null;
  cards: { id: string; statut: string }[];
};

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand-700" : "bg-black/15"
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

const filtres = [
  { value: "tous", label: "Tous" },
  { value: "actif", label: "Actifs" },
  { value: "inactif", label: "Inactifs" },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [error, setError] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("tous");

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setAgents)
      .catch(() => setError(true));
  }, []);

  async function basculer(agent: Agent) {
    const prochain = !agent.actif;
    const maj = (valeur: boolean) =>
      setAgents((prev) =>
        prev ? prev.map((a) => (a.id === agent.id ? { ...a, actif: valeur } : a)) : prev
      );
    maj(prochain);
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actif: prochain }),
      });
      if (!res.ok) throw new Error();
    } catch {
      maj(!prochain);
    }
  }

  const liste = useMemo(() => {
    if (!agents) return [];
    const q = recherche.trim().toLowerCase();
    return agents.filter((a) => {
      const okRecherche =
        !q || `${a.nom} ${a.prenom} ${a.matricule} ${a.agence}`.toLowerCase().includes(q);
      const okFiltre =
        filtre === "tous" || (filtre === "actif" ? a.actif : !a.actif);
      return okRecherche && okFiltre;
    });
  }, [agents, recherche, filtre]);

  return (
    <>
      <PageHeader
        title="Agents"
        subtitle="Gérez les agents et activez ou suspendez leur accès."
        actions={
          <Link href="/admin/generateur" className={btnPrimary}>
            <Plus className="size-4" /> Nouvel agent
          </Link>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <SearchField
            value={recherche}
            onChange={setRecherche}
            placeholder="Rechercher un agent…"
          />
          <div className="flex flex-wrap gap-1.5">
            {filtres.map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltre(f.value)}
                className={chip(filtre === f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="py-10 text-center text-sm text-muted">
          Impossible de charger les agents.
        </Card>
      ) : agents === null ? (
        <ListSkeleton />
      ) : (
        <Card className="p-2 sm:p-3">
          {liste.length === 0 ? (
            <EmptyState
              icon={<Users className="size-6" />}
              title="Aucun agent trouvé"
              text="Modifiez votre recherche ou vos filtres."
            />
          ) : (
            <ul className="divide-y divide-line/70">
              {liste.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-brand-50/60 sm:gap-4"
                >
                  <Avatar
                    photoUrl={a.photoUrl}
                    prenom={a.prenom}
                    nom={a.nom}
                    className="size-11 text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {a.prenom} {a.nom}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {a.matricule} · {a.agence}
                    </p>
                  </div>
                  <span className="hidden sm:block">
                    <Pill tone={a.actif ? "green" : "slate"}>
                      {a.actif ? "Actif" : "Inactif"}
                    </Pill>
                  </span>
                  <Switch
                    checked={a.actif}
                    onChange={() => basculer(a)}
                    label={`${a.actif ? "Désactiver" : "Activer"} ${a.prenom} ${a.nom}`}
                  />
                  {a.cards[0] ? (
                    <Link
                      href={`/admin/cartes/${a.cards[0].id}`}
                      aria-label="Voir la carte"
                      className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-black/[0.05] hover:text-ink"
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  ) : (
                    <span className="size-8 shrink-0" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </>
  );
}