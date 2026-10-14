"use client";

/**
 * MES AGENTS : la seule liste du site. Un agent = une carte.
 * On voit d'un coup d'œil qui est à jour, qui doit être renouvelé,
 * qui n'est pas sur le terrain, et on agit sans ouvrir de page.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Printer, Users } from "lucide-react";
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
  fonction: string;
  actif: boolean;
  photoUrl: string | null;
  cards: { id: string; token: string; statut: string; expireAt: string | null }[];
};

type Tone = "green" | "amber" | "rose" | "slate";
type Etat = { label: string; tone: Tone; aSurveiller: boolean; horsService: boolean };

/** L'état d'un agent, dit avec des mots simples (même ordre de priorité que le contrôle). */
function etatDe(a: Agent): Etat {
  const carte = a.cards[0];
  if (!carte) return { label: "Sans carte", tone: "slate", aSurveiller: false, horsService: false };
  if (carte.statut === "revoque")
    return { label: "Carte retirée", tone: "rose", aSurveiller: false, horsService: false };
  if (!a.actif) return { label: "Hors service", tone: "amber", aSurveiller: false, horsService: true };
  if (carte.statut === "desactive")
    return { label: "En pause", tone: "slate", aSurveiller: false, horsService: false };
  if (carte.expireAt) {
    const reste = new Date(carte.expireAt).getTime() - Date.now();
    if (reste < 0) return { label: "Carte expirée", tone: "rose", aSurveiller: true, horsService: false };
    if (reste < 30 * 86400000)
      return { label: "Expire bientôt", tone: "amber", aSurveiller: true, horsService: false };
  }
  return { label: "À jour", tone: "green", aSurveiller: false, horsService: false };
}

function Interrupteur({
  actif,
  onChange,
  label,
}: {
  actif: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      title={actif ? "Sur le terrain : cliquez pour retirer" : "Hors service : cliquez pour remettre"}
      onClick={onChange}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        actif ? "bg-brand-700" : "bg-black/15"
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform",
          actif && "translate-x-5"
        )}
      />
    </button>
  );
}

const FILTRES = [
  { valeur: "tous", label: "Tous" },
  { valeur: "renouveler", label: "À renouveler" },
  { valeur: "hors", label: "Hors service" },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [erreur, setErreur] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("tous");

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setAgents)
      .catch(() => setErreur(true));
  }, []);

  async function basculer(agent: Agent) {
    const suivant = !agent.actif;
    const maj = (v: boolean) =>
      setAgents((liste) => liste && liste.map((a) => (a.id === agent.id ? { ...a, actif: v } : a)));
    maj(suivant);
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actif: suivant }),
      });
      if (!res.ok) throw new Error();
    } catch {
      maj(!suivant);
    }
  }

  const liste = useMemo(() => {
    if (!agents) return [];
    const q = recherche.trim().toLowerCase();
    return agents.filter((a) => {
      const e = etatDe(a);
      const okRecherche =
        !q || `${a.nom} ${a.prenom} ${a.matricule} ${a.fonction}`.toLowerCase().includes(q);
      const okFiltre =
        filtre === "tous" || (filtre === "renouveler" && e.aSurveiller) || (filtre === "hors" && e.horsService);
      return okRecherche && okFiltre;
    });
  }, [agents, recherche, filtre]);

  const nbRenouveler = agents?.filter((a) => etatDe(a).aSurveiller).length ?? 0;

  return (
    <>
      <PageHeader
        title="Mes agents"
        subtitle={
          agents
            ? agents.length === 0
              ? "Aucun agent pour l’instant."
              : `${agents.length} ${agents.length > 1 ? "agents" : "agent"}${nbRenouveler > 0 ? ` · ${nbRenouveler} à renouveler` : ""}`
            : " "
        }
        actions={
          <Link href="/admin/generateur" className={btnPrimary}>
            <Plus className="size-4" /> Nouvel agent
          </Link>
        }
      />

      {agents && agents.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField value={recherche} onChange={setRecherche} placeholder="Chercher un nom ou un matricule…" />
          <div className="flex flex-wrap gap-1.5">
            {FILTRES.map((f) => (
              <button key={f.valeur} onClick={() => setFiltre(f.valeur)} className={chip(filtre === f.valeur)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {erreur ? (
        <Card className="py-10 text-center text-sm text-muted">
          Impossible de charger les agents. Rechargez la page.
        </Card>
      ) : agents === null ? (
        <ListSkeleton />
      ) : agents.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="size-6" />}
            title="Ajoutez votre premier agent"
            text="Sa carte avec son QR code sera prête à imprimer en quelques secondes."
          />
          <div className="flex justify-center pb-6">
            <Link href="/admin/generateur" className={btnPrimary}>
              <Plus className="size-4" /> Ajouter un agent
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="p-2 sm:p-3">
          {liste.length === 0 ? (
            <EmptyState
              icon={<Users className="size-6" />}
              title="Aucun agent trouvé"
              text="Essayez un autre nom ou un autre filtre."
            />
          ) : (
            <ul className="divide-y divide-line/70">
              {liste.map((a) => {
                const e = etatDe(a);
                const carte = a.cards[0];
                return (
                  <li key={a.id} className="flex items-center gap-2 px-1 py-1 sm:gap-3 sm:px-2">
                    <Link
                      href={carte ? `/admin/cartes/${carte.id}` : "/admin/agents"}
                      className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-brand-50/60"
                    >
                      <Avatar photoUrl={a.photoUrl} prenom={a.prenom} nom={a.nom} className="size-12 text-sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-ink">
                          {a.prenom} {a.nom}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {a.fonction} · {a.matricule}
                        </p>
                      </div>
                      <span className="hidden sm:block">
                        <Pill tone={e.tone}>{e.label}</Pill>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5" />
                    </Link>

                    <Interrupteur actif={a.actif} onChange={() => basculer(a)} label={`${a.prenom} ${a.nom} sur le terrain`} />
                    {carte && (
                      <Link
                        href={`/carte/${carte.token}`}
                        target="_blank"
                        aria-label="Imprimer la carte"
                        title="Imprimer la carte"
                        className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-brand-50 hover:text-brand-800"
                      >
                        <Printer className="size-5" />
                      </Link>
                    )}
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