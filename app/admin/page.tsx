"use client";

/**
 * ACCUEIL : on comprend en 3 secondes si tout va bien.
 * 1. Un message clair (tout va bien / ceci demande votre attention)
 * 2. Un guide de démarrage tant que l'entreprise n'est pas configurée
 * 3. Trois chiffres, puis "À faire" et "Derniers contrôles"
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Circle,
  Plus,
  ScanLine,
  ShieldCheck,
  ShieldX,
  TriangleAlert,
  Users,
  CalendarClock,
} from "lucide-react";
import {
  Avatar,
  Card,
  CardTitle,
  Pill,
  Skeleton,
  cn,
  formatDate,
} from "@/components/admin/ui";

type Donnees = {
  agents: { total: number; actifs: number; inactifs: number };
  cartes: { total: number; valides: number; expirees: number; bientot: number };
  controles: { aujourdhui: number; refuses: number };
  aTraiter: { id: string; expireAt: string; nom: string; prenom: string }[];
  derniers: { id: string; resultat: string; scannedAt: string; nom: string | null; prenom: string | null }[];
};
type Marque = { nomOrganisation: string; aLogo: boolean };

const pluriel = (n: number, un: string, plusieurs: string) => `${n} ${n > 1 ? plusieurs : un}`;

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

function expiration(iso: string) {
  const fin = new Date(iso);
  if (fin < new Date()) return { texte: `Expirée depuis le ${formatDate(iso)}`, rouge: true };
  const jours = Math.ceil((fin.getTime() - Date.now()) / 86400000);
  return {
    texte: jours <= 1 ? "Expire aujourd’hui ou demain" : `Expire dans ${jours} jours`,
    rouge: false,
  };
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
        <p className="text-4xl font-semibold leading-tight tracking-tight text-ink">{valeur}</p>
        <p className="truncate text-xs text-muted">{detail}</p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted transition group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function AccueilPage() {
  const [d, setD] = useState<Donnees | null>(null);
  const [marque, setMarque] = useState<Marque | null>(null);
  const [prenom, setPrenom] = useState("");
  const [erreur, setErreur] = useState(false);

  const charger = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([
        fetch("/api/dashboard").then((r) => (r.ok ? r.json() : Promise.reject())),
        fetch("/api/modele-carte?leger=1").then((r) => (r.ok ? r.json() : null)),
      ]);
      setD(a);
      setMarque(b);
      setErreur(false);
    } catch {
      setErreur(true);
    }
  }, []);

  useEffect(() => {
    charger();
    const id = setInterval(charger, 60000); // les chiffres se mettent à jour tout seuls
    return () => clearInterval(id);
  }, [charger]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => p && setPrenom(String(p.nom).split(" ")[0]))
      .catch(() => {});
  }, []);

  if (erreur && !d) {
    return (
      <Card className="py-12 text-center">
        <p className="text-sm text-muted">Impossible de charger les informations.</p>
        <button onClick={charger} className="mt-4 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-medium text-white">
          Réessayer
        </button>
      </Card>
    );
  }

  if (!d) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-52 rounded-[2rem]" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[108px] rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    );
  }

  const { agents, cartes, controles, aTraiter, derniers } = d;
  const aRenouveler = cartes.expirees + cartes.bientot;
  const salutation = new Date().getHours() < 18 ? "Bonjour" : "Bonsoir";

  // Le message principal : toujours une seule chose à retenir
  const message =
    agents.total === 0
      ? { titre: `Bienvenue${prenom ? `, ${prenom}` : ""} !`, texte: "Commençons par ajouter votre premier agent : sa carte sera prête en quelques secondes.", bouton: "Ajouter un agent" }
      : aRenouveler > 0
      ? { titre: `${pluriel(aRenouveler, "carte à renouveler", "cartes à renouveler")}`, texte: "Renouvelez-les pour que vos agents restent reconnus lors des contrôles.", bouton: "Nouvel agent" }
      : controles.refuses > 0
      ? { titre: `${pluriel(controles.refuses, "contrôle refusé", "contrôles refusés")} aujourd’hui`, texte: "Quelqu’un a présenté une carte qui n’est pas valable.", bouton: "Nouvel agent" }
      : { titre: "Tout est en ordre", texte: `${pluriel(agents.actifs, "agent sur le terrain", "agents sur le terrain")} · ${pluriel(controles.aujourdhui, "contrôle", "contrôles")} aujourd’hui`, bouton: "Nouvel agent" };

  // Guide de démarrage (disparaît quand l'essentiel est fait)
  const entrepriseFaite = !!marque && marque.nomOrganisation.trim() !== "" && marque.nomOrganisation !== "SecuriApp";
  const etapes = [
    { fait: entrepriseFaite, titre: "Donnez le nom de votre entreprise", texte: "Il apparaîtra sur toutes vos cartes.", href: "/admin/modele-carte", bouton: "Personnaliser" },
    { fait: !!marque?.aLogo, titre: "Ajoutez votre logo (facultatif)", texte: "Il remplace le drapeau en haut de la carte.", href: "/admin/modele-carte", bouton: "Ajouter" },
    { fait: agents.total > 0, titre: "Créez votre premier agent", texte: "Photo, nom et fonction : la carte se prépare toute seule.", href: "/admin/generateur", bouton: "Créer" },
  ];
  const faites = etapes.filter((e) => e.fait).length;
  const afficherGuide = !(entrepriseFaite && agents.total > 0);
  const aFaire = controles.refuses > 0 || aTraiter.length > 0;

  return (
    <div className="space-y-4">
      {/* ── Message principal ── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-700 to-brand-900 p-6 text-white sm:p-8">
        <svg viewBox="0 0 800 260" preserveAspectRatio="xMidYMid slice" aria-hidden className="pointer-events-none absolute inset-0 size-full">
          <line x1="600" y1="-20" x2="500" y2="280" stroke="#55b98a" strokeWidth="46" strokeOpacity="0.55" />
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
            right={<Pill tone="green">{faites}/3</Pill>}
          />
          <ul className="divide-y divide-line/70">
            {etapes.map((e) => (
              <li key={e.titre} className="flex items-center gap-3 py-3">
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full",
                    e.fait ? "bg-brand-700 text-white" : "bg-black/[0.05] text-muted"
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
            icone={<Users className="size-7" />}
            label="Agents sur le terrain"
            valeur={agents.actifs}
            detail={agents.inactifs > 0 ? `${agents.inactifs} hors service` : "Tous en service"}
          />
          <Compteur
            href="/admin/verifications"
            icone={<ScanLine className="size-7" />}
            label="Contrôles aujourd’hui"
            valeur={controles.aujourdhui}
            detail={
              controles.aujourdhui === 0 ? "Aucun pour l’instant" : controles.refuses > 0 ? pluriel(controles.refuses, "refusé", "refusés") : "Tous acceptés"
            }
          />
          <Compteur
            href="/admin/agents"
            icone={<CalendarClock className="size-7" />}
            label="Cartes à renouveler"
            valeur={aRenouveler}
            alerte={aRenouveler > 0}
            detail={aRenouveler === 0 ? "Rien à faire" : `${cartes.expirees} expirée${cartes.expirees > 1 ? "s" : ""} · ${cartes.bientot} bientôt`}
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
                    <Link href="/admin/verifications" className="group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-amber-50/60">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
                        <TriangleAlert className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">
                          {pluriel(controles.refuses, "contrôle refusé", "contrôles refusés")} aujourd’hui
                        </p>
                        <p className="text-xs text-muted">Une carte présentée n’était pas valable.</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">Voir</span>
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
                          <p className={cn("truncate text-xs", ex.rouge ? "text-rose-600" : "text-amber-600")}>{ex.texte}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">Renouveler</span>
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
                {derniers.map((l) => {
                  const accepte = l.resultat === "valide";
                  return (
                    <li key={l.id} className="flex items-center gap-3 py-3">
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-full",
                          accepte ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}
                      >
                        {accepte ? <ShieldCheck className="size-5" /> : <ShieldX className="size-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {l.prenom ? `${l.prenom} ${l.nom}` : "Carte inconnue"}
                        </p>
                        <p className="text-xs text-muted">{depuis(l.scannedAt)}</p>
                      </div>
                      <Pill tone={accepte ? "green" : "rose"}>{accepte ? "Acceptée" : "Refusée"}</Pill>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}