"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Check,
  ChevronRight,
  IdCard,
  Plus,
  ScanLine,
  Search,
  ShieldCheck,
  ShieldX,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  Avatar,
  Card,
  CardTitle,
  PageHeader,
  Pill,
  Skeleton,
  btnOutline,
  btnPrimary,
  cn,
  formatDate,
} from "@/components/admin/ui";

type Data = {
  agents: { total: number; actifs: number; inactifs: number };
  cartes: {
    total: number;
    valides: number;
    expirees: number;
    bientot: number;
  };
  controles: { aujourdhui: number; refuses: number };
  aTraiter: {
    id: string;
    expireAt: string;
    nom: string;
    prenom: string;
    matricule: string;
  }[];
  derniers: {
    id: string;
    resultat: string;
    scannedAt: string;
    cardId: string | null;
    nom: string | null;
    prenom: string | null;
  }[];
};

const pluriel = (n: number, un: string, plusieurs: string) =>
  `${n} ${n > 1 ? plusieurs : un}`;

function depuis(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l’instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  return j === 1 ? "hier" : `il y a ${j} jours`;
}

function libelleExpiration(iso: string) {
  const fin = new Date(iso);
  if (fin < new Date()) {
    return { texte: `Carte expirée depuis le ${formatDate(iso)}`, expiree: true };
  }
  const jours = Math.ceil((fin.getTime() - Date.now()) / 86400000);
  const texte =
    jours <= 1
      ? "Expire aujourd’hui ou demain"
      : `Expire dans ${jours} jours (${formatDate(iso)})`;
  return { texte, expiree: false };
}

function Compteur({
  href,
  icone,
  label,
  valeur,
  detail,
  alerte,
}: {
  href: string;
  icone: React.ReactNode;
  label: string;
  valeur: number;
  detail: string;
  alerte?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-2xl",
          alerte ? "bg-amber-50 text-amber-600" : "bg-brand-50 text-brand-700"
        )}
      >
        {icone}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">{label}</p>
        <p className="text-4xl font-semibold leading-tight tracking-tight text-ink">
          {valeur}
        </p>
        <p className="truncate text-xs text-muted">{detail}</p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted transition group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function AccueilPage() {
  const [data, setData] = useState<Data | null>(null);
  const [erreur, setErreur] = useState(false);
  const [dateJour, setDateJour] = useState("");

  const charger = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error();
      setData(await res.json());
      setErreur(false);
    } catch {
      setErreur(true);
    }
  }, []);

  // Mise à jour automatique toutes les minutes
  useEffect(() => {
    charger();
    const id = setInterval(charger, 60000);
    return () => clearInterval(id);
  }, [charger]);

  useEffect(() => {
    const d = new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setDateJour(d.charAt(0).toUpperCase() + d.slice(1));
  }, []);

  const entete = (
    <PageHeader
      title="Accueil"
      subtitle={`${dateJour ? `${dateJour} · ` : ""}Voici l’état de vos agents et de leurs cartes.`}
      actions={
        <>
          <Link href="/admin/generateur" className={btnPrimary}>
            <Plus className="size-4" /> Nouvelle carte
          </Link>
          <Link href="/admin/cartes" className={btnOutline}>
            <Search className="size-4" /> Chercher une carte
          </Link>
        </>
      }
    />
  );

  if (erreur && !data) {
    return (
      <>
        {entete}
        <Card className="py-10 text-center">
          <p className="text-sm text-muted">
            Impossible de charger les informations.
          </p>
          <button onClick={charger} className={`${btnOutline} mt-4`}>
            Réessayer
          </button>
        </Card>
      </>
    );
  }

  if (!data) {
    return (
      <>
        {entete}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[108px] rounded-3xl" />
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-72 rounded-3xl lg:col-span-3" />
          <Skeleton className="h-72 rounded-3xl lg:col-span-2" />
        </div>
      </>
    );
  }

  const { agents, cartes, controles, aTraiter, derniers } = data;
  const nbARenouveler = cartes.expirees + cartes.bientot;
  const toutVaBien = nbARenouveler === 0 && controles.refuses === 0;

  return (
    <>
      {entete}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Compteur
          href="/admin/agents"
          icone={<Users className="size-7" />}
          label="Agents sur le terrain"
          valeur={agents.actifs}
          detail={
            agents.total === 0
              ? "Aucun agent enregistré"
              : agents.inactifs > 0
              ? `${agents.inactifs} pas sur le terrain`
              : "Tous vos agents sont actifs"
          }
        />
        <Compteur
          href="/admin/cartes"
          icone={<IdCard className="size-7" />}
          label="Cartes valides"
          valeur={cartes.valides}
          detail={`Sur ${pluriel(cartes.total, "carte", "cartes")} au total`}
        />
        <Compteur
          href="/admin/verifications"
          icone={<ScanLine className="size-7" />}
          label="Contrôles aujourd’hui"
          valeur={controles.aujourdhui}
          detail={
            controles.aujourdhui === 0
              ? "Aucun contrôle pour l’instant"
              : controles.refuses > 0
              ? `${pluriel(controles.refuses, "refusé", "refusés")}`
              : "Tous acceptés"
          }
        />
        <Compteur
          href="/admin/cartes"
          icone={<CalendarClock className="size-7" />}
          label="Cartes à renouveler"
          valeur={nbARenouveler}
          alerte={nbARenouveler > 0}
          detail={
            nbARenouveler === 0
              ? "Rien à renouveler"
              : `${pluriel(cartes.expirees, "expirée", "expirées")} · ${cartes.bientot} bientôt`
          }
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* À faire */}
        <Card className="lg:col-span-3">
          <CardTitle
            title="À faire"
            subtitle="Ce qui demande votre attention"
          />

          {toutVaBien ? (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="size-7" />
              </span>
              <p className="mt-4 text-base font-semibold text-ink">
                Tout est en ordre
              </p>
              <p className="mt-1 max-w-xs text-sm text-muted">
                Aucune carte à renouveler et aucun contrôle refusé aujourd’hui.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line/70">
              {controles.refuses > 0 && (
                <li>
                  <Link
                    href="/admin/verifications"
                    className="group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-amber-50/60 sm:gap-4"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
                      <TriangleAlert className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">
                        {pluriel(
                          controles.refuses,
                          "contrôle refusé",
                          "contrôles refusés"
                        )}{" "}
                        aujourd’hui
                      </p>
                      <p className="text-xs text-muted">
                        Une carte présentée n’était pas valable.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition group-hover:bg-amber-100">
                      Voir
                    </span>
                  </Link>
                </li>
              )}

              {aTraiter.map((c) => {
                const { texte, expiree } = libelleExpiration(c.expireAt);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/admin/cartes/${c.id}`}
                      className="group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-brand-50/60 sm:gap-4"
                    >
                      <Avatar
                        prenom={c.prenom}
                        nom={c.nom}
                        className="size-11 text-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {c.prenom} {c.nom}
                        </p>
                        <p
                          className={cn(
                            "truncate text-xs",
                            expiree ? "text-rose-600" : "text-amber-600"
                          )}
                        >
                          {texte}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800 transition group-hover:bg-brand-100">
                        Renouveler
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {nbARenouveler > aTraiter.length && (
            <Link
              href="/admin/cartes"
              className="mt-3 block text-center text-sm font-medium text-brand-700 hover:underline"
            >
              Voir toutes les cartes ({nbARenouveler - aTraiter.length} autres à
              renouveler)
            </Link>
          )}
        </Card>

        {/* Derniers contrôles */}
        <Card className="lg:col-span-2">
          <CardTitle
            title="Derniers contrôles"
            subtitle="Les cartes scannées récemment"
            right={
              <Link
                href="/admin/verifications"
                className="inline-flex items-center gap-0.5 text-sm font-medium text-brand-700 hover:underline"
              >
                Tout voir <ChevronRight className="size-4" />
              </Link>
            }
          />

          {derniers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              Aucun contrôle pour le moment. Quand quelqu’un scanne une carte,
              vous le verrez ici.
            </p>
          ) : (
            <ul className="divide-y divide-line/70">
              {derniers.map((l) => {
                const ok = l.resultat === "valide";
                return (
                  <li key={l.id} className="flex items-center gap-3 py-3">
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full",
                        ok
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      )}
                    >
                      {ok ? (
                        <ShieldCheck className="size-5" />
                      ) : (
                        <ShieldX className="size-5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {l.prenom ? `${l.prenom} ${l.nom}` : "Carte inconnue"}
                      </p>
                      <p className="text-xs text-muted">
                        {depuis(l.scannedAt)}
                      </p>
                    </div>
                    <Pill tone={ok ? "green" : "rose"}>
                      {ok ? "Acceptée" : "Refusée"}
                    </Pill>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}