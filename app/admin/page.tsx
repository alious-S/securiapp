"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import {
  Avatar,
  Card,
  CardTitle,
  PageHeader,
  Pill,
  Skeleton,
  StatCard,
  btnOutline,
  btnPrimary,
  cn,
} from "@/components/admin/ui";

type Stats = {
  totalCartes: number;
  cartesActives: number;
  cartesExpirees: number;
  cartesSuspendues: number;
  nombreAgents: number;
  verifsAujourdhui: number;
  verifsSemaine: number;
  verifsParJour: { jour: string; total: number }[];
};

type Agent = {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  agence: string;
  actif: boolean;
  photoUrl: string | null;
};

const MAX_H = 168;
const MIN_H = 44;

function Gauge({
  segments,
  ready,
}: {
  segments: { value: number; stroke: string }[];
  ready: boolean;
}) {
  const R = 78;
  const L = Math.PI * R;
  const W = 26;
  const GAP = 3;
  const sum = segments.reduce((s, x) => s + x.value, 0);
  const d = `M ${100 - R} 100 A ${R} ${R} 0 0 1 ${100 + R} 100`;
  let acc = 0;

  return (
    <svg
      viewBox="0 0 200 104"
      className="w-full"
      role="img"
      aria-label="Répartition des cartes"
    >
      <defs>
        <pattern
          id="gauge-stripes"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="6" height="6" fill="#eef0ec" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#8d9a93" strokeWidth="2" />
        </pattern>
      </defs>
      <path d={d} fill="none" stroke="#eef0ec" strokeWidth={W} />
      {sum > 0 &&
        segments.map((s, i) => {
          const frac = s.value / sum;
          const start = acc * L;
          acc += frac;
          const len = Math.max(frac * L - GAP, 0);
          if (len === 0) return null;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={s.stroke}
              strokeWidth={W}
              strokeDasharray={`${ready ? len : 0} ${L * 2}`}
              strokeDashoffset={-(start + GAP / 2)}
              className="transition-[stroke-dasharray] duration-1000 ease-out"
            />
          );
        })}
    </svg>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let annule = false;
    Promise.all([
      fetch("/api/dashboard").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
      fetch("/api/agents").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
    ])
      .then(([s, a]) => {
        if (annule) return;
        setStats(s);
        setAgents((a as Agent[]).slice(0, 5));
        requestAnimationFrame(() => setReady(true));
      })
      .catch(() => {
        if (!annule) setError(true);
      });
    return () => {
      annule = true;
    };
  }, []);

  const header = (
    <PageHeader
      title="Dashboard"
      subtitle="Suivez les cartes, les agents et les vérifications en temps réel."
      actions={
        <>
          <Link href="/admin/generateur" className={btnPrimary}>
            <Plus className="size-4" /> Nouvelle carte
          </Link>
          <Link href="/admin/alertes" className={btnOutline}>
            Voir les alertes
          </Link>
        </>
      }
    />
  );

  if (error) {
    return (
      <>
        {header}
        <Card className="py-10 text-center text-sm text-muted">
          Impossible de charger les données. Rechargez la page.
        </Card>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        {header}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[148px] rounded-3xl" />
          ))}
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-12">
          <Skeleton className="h-[330px] rounded-3xl xl:col-span-8" />
          <Skeleton className="h-[330px] rounded-3xl xl:col-span-4" />
        </div>
      </>
    );
  }

  const totals = stats.verifsParJour.map((j) => j.total);
  const maxTotal = Math.max(...totals, 0);
  const idxMax = maxTotal > 0 ? totals.indexOf(maxTotal) : -1;
  const todayIdx = stats.verifsParJour.length - 1;

  const sommeGauge =
    stats.cartesActives + stats.cartesExpirees + stats.cartesSuspendues;
  const pctActives =
    sommeGauge > 0 ? Math.round((stats.cartesActives / sommeGauge) * 100) : 0;
  const pctTotal =
    stats.totalCartes > 0
      ? Math.round((stats.cartesActives / stats.totalCartes) * 100)
      : 0;

  return (
    <>
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          hero
          label="Total des cartes"
          value={stats.totalCartes}
          hint={`${stats.cartesActives} cartes actives`}
          href="/admin/cartes"
        />
        <StatCard
          label="Cartes actives"
          value={stats.cartesActives}
          hint={`${pctTotal}% du total`}
          href="/admin/cartes"
        />
        <StatCard
          label="Agents enregistrés"
          value={stats.nombreAgents}
          hint="Tous services confondus"
          href="/admin/agents"
        />
        <StatCard
          label="À surveiller"
          value={stats.cartesExpirees + stats.cartesSuspendues}
          hint={`${stats.cartesExpirees} expirées · ${stats.cartesSuspendues} suspendues`}
          href="/admin/cartes"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        {/* Analytics */}
        <Card className="xl:col-span-8">
          <CardTitle
            title="Vérifications"
            subtitle="Activité des 7 derniers jours"
            right={
              <Pill tone="green">{stats.verifsSemaine} cette semaine</Pill>
            }
          />
          <div className="flex items-end justify-between gap-2 pt-2 sm:gap-4">
            {stats.verifsParJour.map((j, i) => {
              const h =
                j.total === 0
                  ? MIN_H
                  : MIN_H + (j.total / maxTotal) * (MAX_H - MIN_H);
              const isMax = i === idxMax;
              const isToday = i === todayIdx;
              const bulle = j.total > 0 && (isMax || isToday);
              return (
                <div
                  key={`${j.jour}-${i}`}
                  className="flex flex-1 flex-col items-center gap-3"
                >
                  <div className="flex h-[210px] w-full items-end justify-center">
                    <div
                      style={{ height: ready ? h : 0 }}
                      className={cn(
                        "relative w-full max-w-[52px] rounded-full transition-[height] duration-700 ease-out",
                        j.total === 0
                          ? "stripes"
                          : isMax
                          ? "bg-brand-900"
                          : isToday
                          ? "bg-brand-400"
                          : "bg-brand-600"
                      )}
                    >
                      {bulle && ready && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-ink shadow-sm ring-1 ring-black/5">
                          {j.total}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-xs capitalize",
                      isToday ? "font-semibold text-ink" : "text-muted"
                    )}
                  >
                    {j.jour}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Carte sombre : scans du jour */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-linear-to-br from-brand-700 to-brand-900 p-6 text-white xl:col-span-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-radial-gradient(circle at 100% 100%, rgba(255,255,255,0.07) 0 1px, transparent 1px 14px)",
            }}
          />
          <div className="relative">
            <p className="text-[15px] font-medium text-white/90">
              Scans aujourd’hui
            </p>
            <p className="mt-6 text-6xl font-semibold leading-none tracking-tight">
              {stats.verifsAujourdhui}
            </p>
            <p className="mt-3 text-sm text-white/70">
              {stats.verifsSemaine} vérifications sur les 7 derniers jours
            </p>
          </div>
          <Link
            href="/admin/verifications"
            className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50 active:scale-[0.98]"
          >
            Voir l’historique <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        {/* Derniers agents */}
        <Card className="xl:col-span-7">
          <CardTitle
            title="Derniers agents"
            subtitle="Les dernières personnes enregistrées"
            right={
              <Link
                href="/admin/agents"
                className="inline-flex items-center gap-0.5 text-sm font-medium text-brand-700 hover:underline"
              >
                Voir tout <ChevronRight className="size-4" />
              </Link>
            }
          />
          {agents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              Aucun agent pour l’instant.
            </p>
          ) : (
            <ul className="divide-y divide-line/70">
              {agents.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
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
                  <Pill tone={a.actif ? "green" : "slate"}>
                    {a.actif ? "Actif" : "Inactif"}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Jauge */}
        <Card className="xl:col-span-5">
          <CardTitle
            title="Répartition des cartes"
            subtitle="État actuel du parc"
          />
          <div className="relative mx-auto w-full max-w-[300px]">
            <Gauge
              ready={ready}
              segments={[
                { value: stats.cartesActives, stroke: "#11512f" },
                { value: stats.cartesExpirees, stroke: "#55b98a" },
                { value: stats.cartesSuspendues, stroke: "url(#gauge-stripes)" },
              ]}
            />
            <div className="absolute inset-x-0 bottom-0 text-center">
              <p className="text-4xl font-semibold leading-none tracking-tight text-ink">
                {pctActives}%
              </p>
              <p className="mt-1 text-xs text-muted">cartes actives</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="size-2.5 rounded-full bg-brand-800" />
              Actives
              <strong className="text-ink">{stats.cartesActives}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-muted">
              <span className="size-2.5 rounded-full bg-brand-400" />
              Expirées
              <strong className="text-ink">{stats.cartesExpirees}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-muted">
              <span className="stripes size-2.5 rounded-full ring-1 ring-black/10" />
              Suspendues
              <strong className="text-ink">{stats.cartesSuspendues}</strong>
            </span>
          </div>
        </Card>
      </div>
    </>
  );
}