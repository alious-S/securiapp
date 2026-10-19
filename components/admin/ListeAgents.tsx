"use client";

/**
 * LISTE DES AGENTS (partie interactive : recherche, filtres, interrupteur)
 * Les données arrivent déjà chargées par la page (app/admin/agents/page.tsx).
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Printer, Users } from "lucide-react";
import { Avatar, Card, EmptyState, Pill, SearchField, chip, cn } from "@/components/admin/ui";
import { etatAgent } from "@/lib/etat-agent";

type Agent = {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  fonction: string;
  actif: boolean;
  cards: { id: string; token: string; statut: string; expireAt: string | null }[];
};

const FILTRES = [
  { valeur: "tous", label: "Tous" },
  { valeur: "renouveler", label: "À renouveler" },
  { valeur: "hors", label: "Hors service" },
];

function Interrupteur({ actif, onChange, label }: { actif: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      title={actif ? "Sur le terrain : cliquez pour retirer" : "Hors service : cliquez pour remettre"}
      onClick={onChange}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", actif ? "bg-brand-600" : "bg-black/15")}
    >
      <span className={cn("absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform", actif && "translate-x-5")} />
    </button>
  );
}

export default function ListeAgents({ agentsInitiaux }: { agentsInitiaux: Agent[] }) {
  const router = useRouter();
  const [agents, setAgents] = useState(agentsInitiaux);
  const [agentsInitiauxPrecedents, setAgentsInitiauxPrecedents] = useState(agentsInitiaux);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("tous");

  // Quand la page est rafraîchie par le serveur, on reprend ses données
  if (agentsInitiaux !== agentsInitiauxPrecedents) {
    setAgentsInitiauxPrecedents(agentsInitiaux);
    setAgents(agentsInitiaux);
  }

  async function basculer(agent: Agent) {
    const suivant = !agent.actif;
    const maj = (v: boolean) => setAgents((l) => l.map((a) => (a.id === agent.id ? { ...a, actif: v } : a)));
    maj(suivant); // l'interrupteur réagit tout de suite
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actif: suivant }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      maj(!suivant);
    }
  }

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return agents.filter((a) => {
      const e = etatAgent(a.actif, a.cards[0]);
      const okRecherche = !q || `${a.nom} ${a.prenom} ${a.matricule} ${a.fonction}`.toLowerCase().includes(q);
      const okFiltre =
        filtre === "tous" || (filtre === "renouveler" && e.aSurveiller) || (filtre === "hors" && e.horsService);
      return okRecherche && okFiltre;
    });
  }, [agents, recherche, filtre]);

  return (
    <>
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

      <Card className="p-2 sm:p-3">
        {liste.length === 0 ? (
          <EmptyState icon={<Users className="size-6" />} title="Aucun agent trouvé" text="Essayez un autre nom ou un autre filtre." />
        ) : (
          <ul className="divide-y divide-line/70">
            {liste.map((a) => {
              const e = etatAgent(a.actif, a.cards[0]);
              const carte = a.cards[0];
              return (
                <li key={a.id} className="flex items-center gap-2 px-1 py-1 sm:gap-3 sm:px-2">
                  <Link
                    href={carte ? `/admin/cartes/${carte.id}` : "/admin/agents"}
                    className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-brand-50/60"
                  >
                    <Avatar prenom={a.prenom} nom={a.nom} className="size-12 text-sm" />
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
    </>
  );
}