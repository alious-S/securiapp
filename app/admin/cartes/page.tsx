"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, IdCard, Plus } from "lucide-react";
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
  etatCarte,
  formatDate,
} from "@/components/admin/ui";

type CardItem = {
  id: string;
  statut: string;
  expireAt: string | null;
  agent: {
    nom: string;
    prenom: string;
    matricule: string;
    agence: string;
    photoUrl: string | null;
  };
};

const filtres = [
  { value: "tous", label: "Toutes" },
  { value: "actif", label: "Actives" },
  { value: "desactive", label: "Désactivées" },
  { value: "revoque", label: "Révoquées" },
];

function CartesContent() {
  const params = useSearchParams();
  const qUrl = params.get("q") ?? "";

  const [recherche, setRecherche] = useState(qUrl);
  const [statut, setStatut] = useState("tous");
  const [cards, setCards] = useState<CardItem[] | null>(null);
  const [error, setError] = useState(false);

  // Synchronise avec la recherche de la barre du haut
  useEffect(() => {
    setRecherche(qUrl);
  }, [qUrl]);

  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const sp = new URLSearchParams();
        if (statut !== "tous") sp.set("statut", statut);
        if (recherche.trim()) sp.set("q", recherche.trim());
        const res = await fetch(`/api/cards?${sp.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error();
        setCards(await res.json());
        setError(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError(true);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [statut, recherche]);

  return (
    <>
      <PageHeader
        title="Cartes"
        subtitle="Consultez, filtrez et gérez toutes les cartes d’agents."
        actions={
          <Link href="/admin/generateur" className={btnPrimary}>
            <Plus className="size-4" /> Nouvelle carte
          </Link>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <SearchField
            value={recherche}
            onChange={setRecherche}
            placeholder="Nom, prénom ou matricule…"
          />
          <div className="flex flex-wrap gap-1.5">
            {filtres.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatut(f.value)}
                className={chip(statut === f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="py-10 text-center text-sm text-muted">
          Impossible de charger les cartes.
        </Card>
      ) : cards === null ? (
        <ListSkeleton />
      ) : (
        <Card className="p-2 sm:p-3">
          {cards.length === 0 ? (
            <EmptyState
              icon={<IdCard className="size-6" />}
              title="Aucune carte trouvée"
              text="Essayez un autre filtre ou une autre recherche."
            />
          ) : (
            <ul className="divide-y divide-line/70">
              {cards.map((c) => {
                const etat = etatCarte(c.statut, c.expireAt);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/admin/cartes/${c.id}`}
                      className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-brand-50/60 sm:gap-4"
                    >
                      <Avatar
                        photoUrl={c.agent.photoUrl}
                        prenom={c.agent.prenom}
                        nom={c.agent.nom}
                        className="size-11 text-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {c.agent.prenom} {c.agent.nom}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {c.agent.matricule} · {c.agent.agence}
                        </p>
                      </div>
                      <div className="hidden text-right md:block">
                        <p className="text-[11px] text-muted">Expiration</p>
                        <p className="text-xs font-medium text-ink">
                          {c.expireAt ? formatDate(c.expireAt) : "Illimitée"}
                        </p>
                      </div>
                      <Pill tone={etat.tone}>{etat.label}</Pill>
                      <ChevronRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5" />
                    </Link>
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

export default function CartesPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <CartesContent />
    </Suspense>
  );
}