/**
 * ACCUEIL (chargé côté serveur : la page arrive déjà remplie)
 * 1. Un message clair : tout va bien, ou ceci demande votre attention
 * 2. Un guide de démarrage tant que l'entreprise n'est pas configurée
 * 3. Trois chiffres, puis "À faire" et "Derniers contrôles"
 * Les chiffres viennent de lib/donnees.ts.
 */
import Link from "next/link";
import {
  CalendarClock,
  Check,
  ChevronRight,
  Circle,
  Plus,
  ScanLine,
  ShieldCheck,
  ShieldX,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Avatar, Card, CardTitle, Pill, cn, formatDate } from "@/components/admin/ui";
import { chargerAccueil, chargerModele } from "@/lib/donnees";
import { getSession } from "@/lib/session";

// Les chiffres changent à chaque contrôle : on ne fige jamais cette page
export const dynamic = "force-dynamic";

const pluriel = (n: number, un: string, plusieurs: string) => `${n} ${n > 1 ? plusieurs : un}`;

function depuis(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "à l’instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  return j === 1 ? "hier" : `il y a ${j} jours`;
}

function expiration(fin: Date) {
  if (fin < new Date()) return { texte: `Expirée depuis le ${formatDate(fin)}`, rouge: true };
  const jours = Math.ceil((fin.getTime() - Date.now()) / 86_400_000);
  return {
    texte: jours <= 1 ? "Expire aujourd’hui ou demain" : `Expire dans ${jours} jours`,
    rouge: false,
  };
}

// Chaque chiffre a sa couleur : vert (agents), bleu (contrôles), ambre (à faire)
const TEINTES = {
  vert: {
    fond: "from-[#e4f4ea]",
    tuile: "bg-brand-600 shadow-[0_6px_14px_rgba(31,131,89,0.28)]",
    detail: "text-brand-700",
  },
  bleu: {
    fond: "from-[#e0f1fd]",
    tuile: "bg-sky-600 shadow-[0_6px_14px_rgba(2,132,199,0.28)]",
    detail: "text-sky-700",
  },
  ambre: {
    fond: "from-[#fdf0d5]",
    tuile: "bg-amber-500 shadow-[0_6px_14px_rgba(245,158,11,0.3)]",
    detail: "text-amber-700",
  },
};

function Compteur({
  href,
  icone,
  label,
  valeur,
  detail,
  teinte,
}: {
  href: string;
  icone: React.ReactNode;
  label: string;
  valeur: number;
  detail: string;
  teinte: keyof typeof TEINTES;
}) {
  const t = TEINTES[teinte];
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 rounded-3xl bg-linear-to-br to-white to-60% p-5 ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-md",
        t.fond
      )}
    >
      <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl text-white", t.tuile)}>
        {icone}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">{label}</p>
        <p className="text-4xl font-semibold leading-tight tracking-tight text-ink">{valeur}</p>
        <p className={cn("truncate text-xs font-medium", t.detail)}>{detail}</p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted transition group-hover:translate-x-0.5" />
    </Link>
  );
}

export default async function AccueilPage() {
  const [d, modele, session] = await Promise.all([chargerAccueil(), chargerModele(), getSession()]);
  const { agents, cartes, controles, aTraiter, derniers } = d;

  const prenom = session?.nom.split(" ")[0] ?? "";
  const heure =
    parseInt(
      new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Africa/Bamako" }).format(new Date()),
      10
    ) % 24;
  const salutation = heure < 18 ? "Bonjour" : "Bonsoir";
  const aRenouveler = cartes.expirees + cartes.bientot;
  const aFaire = controles.refuses > 0 || aTraiter.length > 0;

  // Le message principal : toujours une seule chose à retenir
  const message =
    agents.total === 0
      ? {
          titre: `Bienvenue${prenom ? `, ${prenom}` : ""} !`,
          texte: "Commençons par ajouter votre premier agent : sa carte sera prête en quelques secondes.",
          bouton: "Ajouter un agent",
        }
      : aRenouveler > 0
      ? {
          titre: pluriel(aRenouveler, "carte à renouveler", "cartes à renouveler"),
          texte: "Renouvelez-les pour que vos agents restent reconnus lors des contrôles.",
          bouton: "Nouvel agent",
        }
      : controles.refuses > 0
      ? {
          titre: `${pluriel(controles.refuses, "contrôle refusé", "contrôles refusés")} aujourd’hui`,
          texte: "Quelqu’un a présenté une carte qui n’est pas valable.",
          bouton: "Nouvel agent",
        }
      : {
          titre: "Tout est en ordre",
          texte: `${pluriel(agents.actifs, "agent sur le terrain", "agents sur le terrain")} · ${pluriel(controles.aujourdhui, "contrôle", "contrôles")} aujourd’hui`,
          bouton: "Nouvel agent",
        };

  // Guide de démarrage : disparaît quand l'essentiel est fait
  const entrepriseFaite = modele.nomOrganisation.trim() !== "" && modele.nomOrganisation !== "SecuriApp";
  const etapes = [
    { fait: entrepriseFaite, titre: "Donnez le nom de votre entreprise", texte: "Il apparaîtra sur toutes vos cartes.", href: "/admin/modele-carte", bouton: "Personnaliser" },
    { fait: !!modele.logoSrc, titre: "Ajoutez votre logo (facultatif)", texte: "Il remplace le drapeau en haut de la carte.", href: "/admin/modele-carte", bouton: "Ajouter" },
    { fait: agents.total > 0, titre: "Créez votre premier agent", texte: "Photo, nom et fonction : la carte se prépare toute seule.", href: "/admin/generateur", bouton: "Créer" },
  ];
  const afficherGuide = !(entrepriseFaite && agents.total > 0);

  return (
    <div className="space-y-4">
      {/* ── Message principal ── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-700 to-brand-900 p-6 text-white sm:p-8">
        <svg viewBox="0 0 800 260" preserveAspectRatio="xMidYMid slice" aria-hidden className="pointer-events-none absolute inset-0 size-full">
          <line x1="600" y1="-20" x2="500" y2="280" stroke="#55b98a" strokeWidth="46" strokeOpacity="0.55" />
          <line x1="655" y1="-20" x2="560" y2="280" stroke="#fcd34d" strokeWidth="6" strokeOpacity="0.85" />
          <line x1="700" y1="-20" x2="610" y2="280" stroke="#fff" strokeWidth="12" strokeOpacity="0.14" />
          <line x1="-20" y1="60" x2="140" y2="280" stroke="#fff" strokeWidth="40" strokeOpacity="0.07" />
        </svg>
        <div className="relative max-w-xl">
          <p className="text-sm text-white/70">
            {salutation}
            {prenom ? `, ${prenom}` : ""}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{message.titre}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-white/80">{message.texte}</p>
          <Link
            href="/admin/generateur"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50 active:scale-[0.98]"
          >
            <Plus className="size-4" /> {message.bouton}
          </Link>
        </div>
      </section>

      {/* ── Guide de démarrage ── */}
      {afficherGuide && (
        <Card>
          <CardTitle
            title="Pour bien démarrer"
            subtitle="Quelques minutes suffisent"
            right={<Pill tone="green">{etapes.filter((e) => e.fait).length}/3</Pill>}
          />
          <ul className="divide-y divide-line/70">
            {etapes.map((e) => (
              <li key={e.titre} className="flex items-center gap-3 py-3">
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full",
                    e.fait ? "bg-brand-600 text-white" : "bg-sky-50 text-sky-600"
                  )}
                >
                  {e.fait ? <Check className="size-5" /> : <Circle className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-semibold", e.fait ? "text-muted line-through" : "text-ink")}>{e.titre}</p>
                  <p className="text-xs text-muted">{e.texte}</p>
                </div>
                {!e.fait && (
                  <Link href={e.href} className="shrink-0 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800 transition hover:bg-brand-100">
                    {e.bouton}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ── Trois chiffres ── */}
      {agents.total > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Compteur
            href="/admin/agents"
            teinte="vert"
            icone={<Users className="size-7" />}
            label="Agents sur le terrain"
            valeur={agents.actifs}
            detail={agents.inactifs > 0 ? `${agents.inactifs} hors service` : "Tous en service"}
          />
          <Compteur
            href="/admin/verifications"
            teinte="bleu"
            icone={<ScanLine className="size-7" />}
            label="Contrôles aujourd’hui"
            valeur={controles.aujourdhui}
            detail={
              controles.aujourdhui === 0
                ? "Aucun pour l’instant"
                : controles.refuses > 0
                ? pluriel(controles.refuses, "refusé", "refusés")
                : "Tous acceptés"
            }
          />
          <Compteur
            href="/admin/agents"
            teinte={aRenouveler > 0 ? "ambre" : "vert"}
            icone={<CalendarClock className="size-7" />}
            label="Cartes à renouveler"
            valeur={aRenouveler}
            detail={
              aRenouveler === 0
                ? "Rien à faire"
                : `${pluriel(cartes.expirees, "expirée", "expirées")} · ${cartes.bientot} bientôt`
            }
          />
        </div>
      )}

      {/* ── À faire + derniers contrôles ── */}
      {agents.total > 0 && (
        <div className="grid gap-4 lg:grid-cols-5">
          {aFaire && (
            <Card className="lg:col-span-3">
              <CardTitle title="À faire" subtitle="Ce qui demande votre attention" />
              <ul className="divide-y divide-line/70">
                {controles.refuses > 0 && (
                  <li>
                    <Link href="/admin/alertes" className="group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-amber-50/60">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
                        <TriangleAlert className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">
                          {pluriel(controles.refuses, "contrôle refusé", "contrôles refusés")} aujourd’hui
                        </p>
                        <p className="text-xs text-muted">Une carte présentée n’était pas valable.</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">Voir</span>
                    </Link>
                  </li>
                )}
                {aTraiter.map((c) => {
                  const ex = expiration(c.expireAt);
                  return (
                    <li key={c.id}>
                      <Link href={`/admin/cartes/${c.id}`} className="group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-brand-50/60">
                        <Avatar prenom={c.prenom} nom={c.nom} className="size-11 text-sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">
                            {c.prenom} {c.nom}
                          </p>
                          <p className={cn("truncate text-xs font-medium", ex.rouge ? "text-rose-600" : "text-amber-600")}>{ex.texte}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800">Renouveler</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          <Card className={aFaire ? "lg:col-span-2" : "lg:col-span-5"}>
            <CardTitle
              title="Derniers contrôles"
              subtitle="Les cartes scannées récemment"
              right={
                <Link href="/admin/verifications" className="inline-flex items-center gap-0.5 text-sm font-medium text-brand-700 hover:underline">
                  Tout voir <ChevronRight className="size-4" />
                </Link>
              }
            />
            {derniers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                Aucun contrôle pour le moment. Dès que quelqu’un scanne une carte, vous le verrez ici.
              </p>
            ) : (
              <ul className="divide-y divide-line/70">
                {derniers.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-3">
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full",
                        l.accepte ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                      )}
                    >
                      {l.accepte ? <ShieldCheck className="size-5" /> : <ShieldX className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {l.prenom ? `${l.prenom} ${l.nom}` : "Carte inconnue"}
                      </p>
                      <p className="text-xs text-muted">{depuis(l.scannedAt)}</p>
                    </div>
                    <Pill tone={l.accepte ? "green" : "rose"}>{l.accepte ? "Acceptée" : "Refusée"}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}