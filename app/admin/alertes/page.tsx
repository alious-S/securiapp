"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Siren, TriangleAlert, Zap } from "lucide-react";
import {
  Card,
  EmptyState,
  PageHeader,
  Pill,
  Skeleton,
  cn,
  etatCarte,
  formatDate,
  formatTime,
} from "@/components/admin/ui";

type Carte = {
  id: string;
  statut: string;
  expireAt: string | null;
  agent: { nom: string; prenom: string; matricule: string };
};
type LogInvalide = { id: string; scannedAt: string; card: Carte };
type CarteFrequence = { count: number; card: Carte };
type AlertesData = {
  cartesInvalidesUtilisees: LogInvalide[];
  cartesFrequenceAnormale: CarteFrequence[];
  tentativesInconnues: number;
};

const accents = {
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
  yellow: "bg-yellow-50 text-yellow-600",
};

function Section({
  tone,
  icon,
  title,
  subtitle,
  children,
}: {
  tone: keyof typeof accents;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", accents[tone])}>
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}

export default function AlertesPage() {
  const [data, setData] = useState<AlertesData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/alertes")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const header = (
    <PageHeader
      title="Alertes"
      subtitle="Activités suspectes détectées sur les cartes."
    />
  );

  if (error) {
    return (
      <>
        {header}
        <Card className="py-10 text-center text-sm text-muted">
          Impossible de charger les alertes.
        </Card>
      </>
    );
  }

  if (!data) {
    return (
      <>
        {header}
        <Skeleton className="h-40 rounded-3xl" />
      </>
    );
  }

  const total =
    data.cartesInvalidesUtilisees.length +
    data.cartesFrequenceAnormale.length +
    (data.tentativesInconnues > 10 ? 1 : 0);

  if (total === 0) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            icon={<ShieldCheck className="size-6" />}
            title="Aucune activité suspecte"
            text="Tout est calme : aucune alerte sur les dernières 24 heures."
          />
        </Card>
      </>
    );
  }

  return (
    <>
      {header}
      <div className="space-y-4">
        {data.cartesInvalidesUtilisees.length > 0 && (
          <Section
            tone="rose"
            icon={<Siren className="size-5" />}
            title="Cartes bloquées présentées au contrôle"
            subtitle="Cartes révoquées ou désactivées scannées ces dernières 24 heures"
          >
            <ul className="divide-y divide-line/70">
              {data.cartesInvalidesUtilisees.map((l) => {
                const etat = etatCarte(l.card.statut, l.card.expireAt);
                return (
                  <li key={l.id}>
                    <Link
                      href={`/admin/cartes/${l.card.id}`}
                      className="group flex items-center gap-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {l.card.agent.prenom} {l.card.agent.nom}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {l.card.agent.matricule} · {formatDate(l.scannedAt)} à{" "}
                          {formatTime(l.scannedAt)}
                        </p>
                      </div>
                      <Pill tone={etat.tone}>{etat.label}</Pill>
                      <ChevronRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {data.cartesFrequenceAnormale.length > 0 && (
          <Section
            tone="amber"
            icon={<Zap className="size-5" />}
            title="Fréquence de scan anormale"
            subtitle="Plus de 5 scans en une heure : carte peut-être copiée"
          >
            <ul className="divide-y divide-line/70">
              {data.cartesFrequenceAnormale.map((c) => (
                <li key={c.card.id}>
                  <Link
                    href={`/admin/cartes/${c.card.id}`}
                    className="group flex items-center gap-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {c.card.agent.prenom} {c.card.agent.nom}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {c.card.agent.matricule}
                      </p>
                    </div>
                    <Pill tone="amber">{c.count} scans / 1 h</Pill>
                    <ChevronRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.tentativesInconnues > 10 && (
          <Section
            tone="yellow"
            icon={<TriangleAlert className="size-5" />}
            title={`${data.tentativesInconnues} tentatives sur des cartes inexistantes`}
            subtitle="Sur 24 heures : possible tentative de deviner des jetons au hasard"
          />
        )}
      </div>
    </>
  );
}