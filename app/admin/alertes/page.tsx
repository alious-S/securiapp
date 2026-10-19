/**
 * ALERTES : ce qui paraît suspect sur les dernières 24 heures.
 * Chaque alerte dit en une phrase ce qui s'est passé et ce qu'il faut en penser.
 */
import Link from "next/link";
import { ChevronRight, ShieldCheck, Siren, TriangleAlert, Zap } from "lucide-react";
import { Avatar, Card, EmptyState, PageHeader, Pill, cn, formatDate, formatTime } from "@/components/admin/ui";
import { chargerAlertes } from "@/lib/donnees";

export const dynamic = "force-dynamic";

const ACCENTS = {
  rose: "bg-rose-100 text-rose-600",
  amber: "bg-amber-100 text-amber-600",
  sky: "bg-sky-100 text-sky-600",
};

function Section({
  couleur,
  icone,
  titre,
  explication,
  children,
}: {
  couleur: keyof typeof ACCENTS;
  icone: React.ReactNode;
  titre: string;
  explication: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", ACCENTS[couleur])}>{icone}</span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-ink">{titre}</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{explication}</p>
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}

export default async function AlertesPage() {
  const { bloquees, frequentes, inconnues } = await chargerAlertes();
  const total = bloquees.length + frequentes.length + (inconnues > 10 ? 1 : 0);

  return (
    <>
      <PageHeader
        title="Alertes"
        subtitle={total === 0 ? "Rien de suspect sur les dernières 24 heures." : `${total} point${total > 1 ? "s" : ""} à surveiller (dernières 24 heures)`}
      />

      {total === 0 ? (
        <Card>
          <EmptyState
            icon={<ShieldCheck className="size-6" />}
            title="Tout est calme"
            text="Aucune carte retirée n’a été présentée et aucune activité inhabituelle n’a été détectée."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {bloquees.length > 0 && (
            <Section
              couleur="rose"
              icone={<Siren className="size-5" />}
              titre="Une carte retirée a été présentée"
              explication="Quelqu’un a scanné une carte retirée ou en pause. Elle a été refusée. C’est peut-être une carte perdue ou volée."
            >
              <ul className="divide-y divide-line/70">
                {bloquees.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/cartes/${l.card.id}`} className="group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-rose-50/50">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {l.card.agent.prenom} {l.card.agent.nom}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {l.card.agent.matricule} · {formatDate(l.scannedAt)} à {formatTime(l.scannedAt)}
                        </p>
                      </div>
                      <Pill tone="rose">{l.card.statut === "revoque" ? "Carte retirée" : "En pause"}</Pill>
                      <ChevronRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {frequentes.length > 0 && (
            <Section
              couleur="amber"
              icone={<Zap className="size-5" />}
              titre="Une carte est scannée très souvent"
              explication="Plus de 5 contrôles en une heure pour la même carte. Elle a peut-être été photocopiée."
            >
              <ul className="divide-y divide-line/70">
                {frequentes.map((f) => (
                  <li key={f.card.id}>
                    <Link href={`/admin/cartes/${f.card.id}`} className="group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-amber-50/60">
                      <Avatar prenom={f.card.agent.prenom} nom={f.card.agent.nom} className="size-10 text-xs" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {f.card.agent.prenom} {f.card.agent.nom}
                        </p>
                        <p className="truncate text-xs text-muted">{f.card.agent.matricule}</p>
                      </div>
                      <Pill tone="amber">{f.nombre} contrôles en 1 h</Pill>
                      <ChevronRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {inconnues > 10 && (
            <Section
              couleur="sky"
              icone={<TriangleAlert className="size-5" />}
              titre={`${inconnues} cartes inconnues scannées`}
              explication="Des codes qui n’existent pas ont été présentés. Quelqu’un essaie peut-être de fabriquer de fausses cartes."
            />
          )}
        </div>
      )}
    </>
  );
}