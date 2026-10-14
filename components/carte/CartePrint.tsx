"use client";

/**
 * IMPRESSION ET PERSONNALISATION DE LA CARTE
 * -------------------------------------------
 * Une seule page pour tout faire : à gauche la carte telle qu'elle sera
 * imprimée, à droite les réglages (logo, textes, informations, couleur).
 * Chaque changement se voit tout de suite. "Enregistrer" garde le modèle
 * pour toutes les prochaines cartes.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ImagePlus,
  Info,
  Loader2,
  Printer,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  PageHeader,
  Pill,
  btnMuted,
  btnPrimary,
  btnSoft,
  chip,
  cn,
  inputClass,
} from "@/components/admin/ui";
import CarteVisuelle, { type DonneesCarte } from "@/components/carte/CarteVisuelle";
import {
  COULEURS,
  COULEUR_IDS,
  MODELE_PAR_DEFAUT,
  type ChampsCarte,
  type EnteteGauche,
  type ModeleCarte,
} from "@/lib/modele-carte";

type Props = {
  exemple?: boolean; // true = page "Ma carte" (carte d'exemple, sans agent précis)
  retour?: { href: string; label: string };
  titre?: string;
  etat?: { label: string; tone: "green" | "amber" | "rose" | "slate" };
  donnees: DonneesCarte;
  modeleInitial: ModeleCarte;
  nomInitial: string;
  logoInitial: string | null; // adresse du logo déjà enregistré
};

type Affichage = "tous" | "recto" | "verso";

const AFFICHAGES: { valeur: Affichage; label: string }[] = [
  { valeur: "tous", label: "Recto et verso" },
  { valeur: "recto", label: "Recto seul" },
  { valeur: "verso", label: "Verso seul" },
];

const ENTETES: { valeur: EnteteGauche; label: string }[] = [
  { valeur: "drapeau", label: "Drapeau du Mali" },
  { valeur: "logo", label: "Mon logo" },
  { valeur: "aucun", label: "Rien" },
];

const CHAMPS: { cle: keyof ChampsCarte; label: string }[] = [
  { cle: "matricule", label: "Numéro de matricule" },
  { cle: "sexe", label: "Sexe" },
  { cle: "fonction", label: "Fonction" },
  { cle: "entreprise", label: "Nom de l’entreprise" },
  { cle: "emission", label: "Date d’émission" },
  { cle: "expiration", label: "Date d’expiration" },
];

// Taille de l'aperçu à l'écran (à l'impression la carte reprend sa taille réelle)
const STYLE_APERCU = `
.carte-vue { zoom: 1.1; }
@media (min-width: 480px) { .carte-vue { zoom: 1.6; } }
@media (min-width: 1536px) { .carte-vue { zoom: 2; } }
@media print { .carte-vue { zoom: 1 !important; } }
`;

/** Réduit le logo (400 px maximum) en gardant sa transparence. */
async function preparerLogo(fichier: File): Promise<string> {
  const url = URL.createObjectURL(fichier);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const largeur = img.naturalWidth || 300;
    const hauteur = img.naturalHeight || 300;
    const echelle = Math.min(1, 400 / Math.max(largeur, hauteur));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(largeur * echelle));
    canvas.height = Math.max(1, Math.round(hauteur * echelle));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let donnees = canvas.toDataURL("image/png");
    if (donnees.length > 300_000) donnees = canvas.toDataURL("image/webp", 0.9);
    if (donnees.length > 380_000) throw new Error("trop lourd");
    return donnees;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Section({
  titre,
  aide,
  children,
}: {
  titre: string;
  aide?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line pt-5 first:border-0 first:pt-0">
      <p className="text-sm font-semibold text-ink">{titre}</p>
      {aide && <p className="mt-0.5 text-xs text-muted">{aide}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Interrupteur({
  actif,
  onChange,
  label,
}: {
  actif: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      onClick={() => onChange(!actif)}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-1.5 text-left text-sm text-ink transition hover:bg-black/[0.03]"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          actif ? "bg-brand-700" : "bg-black/15"
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            actif && "translate-x-5"
          )}
        />
      </span>
    </button>
  );
}

function ChampTexte({
  label,
  valeur,
  onChange,
  max,
  placeholder,
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  max: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        value={valeur}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

export default function CartePrint(p: Props) {
  const [modele, setModele] = useState<ModeleCarte>(p.modeleInitial);
  const [nom, setNom] = useState(p.nomInitial);
  const [logoSrc, setLogoSrc] = useState<string | null>(p.logoInitial);
  // undefined = logo inchangé, null = logo retiré, texte = nouveau logo à enregistrer
  const [logoChange, setLogoChange] = useState<string | null | undefined>(undefined);
  const [sauve, setSauve] = useState({ modele: p.modeleInitial, nom: p.nomInitial });
  const [affichage, setAffichage] = useState<Affichage>("tous");
  const [emblemeOk, setEmblemeOk] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const fichierRef = useRef<HTMLInputElement>(null);

  const modifie =
    JSON.stringify(modele) !== JSON.stringify(sauve.modele) ||
    nom !== sauve.nom ||
    logoChange !== undefined;
  const donnees: DonneesCarte = { ...p.donnees, entreprise: nom };

  function changer(partie: Partial<ModeleCarte>) {
    setModele((m) => ({ ...m, ...partie }));
    setMessage(null);
  }

  function changerChamp(cle: keyof ChampsCarte, valeur: boolean) {
    setModele((m) => ({ ...m, champs: { ...m.champs, [cle]: valeur } }));
    setMessage(null);
  }

  async function choisirLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;
    try {
      const logo = await preparerLogo(fichier);
      setLogoSrc(logo);
      setLogoChange(logo);
      changer({ enteteGauche: "logo" });
    } catch {
      setMessage({
        ok: false,
        texte: "Ce fichier ne peut pas être utilisé. Essayez un logo PNG ou JPEG.",
      });
    }
  }

  function retirerLogo() {
    setLogoSrc(null);
    setLogoChange(null);
    if (modele.enteteGauche === "logo") changer({ enteteGauche: "drapeau" });
  }

  async function enregistrer() {
    setEnvoi(true);
    setMessage(null);
    try {
      const res = await fetch("/api/modele-carte", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: modele, nomOrganisation: nom, logo: logoChange }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Enregistrement impossible.");
      setSauve({ modele, nom });
      setLogoChange(undefined);
      window.dispatchEvent(new Event("marque-modifiee")); // met à jour le menu
      setMessage({
        ok: true,
        texte: "Enregistré. Toutes vos prochaines cartes utiliseront ce modèle.",
      });
    } catch (erreur) {
      setMessage({
        ok: false,
        texte: erreur instanceof Error ? erreur.message : "Enregistrement impossible.",
      });
    } finally {
      setEnvoi(false);
    }
  }

  const face = (nomFace: "recto" | "verso", classe?: string) => (
    <CarteVisuelle
      face={nomFace}
      modele={modele}
      donnees={donnees}
      logoSrc={logoSrc}
      emblemeOk={emblemeOk}
      onEmblemeIntrouvable={() => setEmblemeOk(false)}
      className={classe}
    />
  );

  return (
    <div
      className={cn(
        "carte-print-root print:block print:min-h-0 print:bg-white print:p-0",
        !p.exemple && "min-h-dvh bg-canvas px-4 py-6"
      )}
    >
      <style>{STYLE_APERCU}</style>

      {/* ── En-tête (non imprimé) ── */}
      <div className="mx-auto max-w-6xl print:hidden">
        {p.exemple ? (
          <PageHeader
            title="Ma carte"
            subtitle="Choisissez l’apparence de vos cartes. Chaque changement se voit tout de suite."
            actions={
              <button onClick={() => window.print()} className={btnSoft}>
                <Printer className="size-4" /> Imprimer un exemple
              </button>
            }
          />
        ) : (
          <div className="mb-6">
            {p.retour && (
              <Link
                href={p.retour.href}
                className="mb-3 inline-flex items-center gap-1 text-sm text-muted transition hover:text-ink"
              >
                <ChevronLeft className="size-4" /> {p.retour.label}
              </Link>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-ink">
                  {p.titre}
                </h1>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                  {p.donnees.matricule}
                  {p.etat && <Pill tone={p.etat.tone}>{p.etat.label}</Pill>}
                </div>
              </div>
              <button onClick={() => window.print()} className={btnPrimary}>
                <Printer className="size-4" /> Imprimer la carte
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1fr_360px] print:block print:max-w-none">
        {/* ── Aperçu : c'est exactement ce qui sera imprimé ── */}
        <div>
          <div className="mb-4 flex flex-wrap gap-1.5 print:hidden">
            {AFFICHAGES.map((a) => (
              <button
                key={a.valeur}
                onClick={() => setAffichage(a.valeur)}
                className={chip(affichage === a.valeur)}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="carte-vue mx-auto w-fit print:mx-0">
            <div className="flex flex-col gap-4 print:block">
              {face(
                "recto",
                cn(affichage === "tous" && "carte-break", affichage === "verso" && "print:hidden")
              )}
              {face("verso", affichage === "recto" ? "print:hidden" : undefined)}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800 print:hidden">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              À l’impression, choisissez votre imprimante à cartes, le format{" "}
              <strong>CR80 (85,6 × 54 mm)</strong>, l’échelle <strong>100 %</strong>, aucune
              marge, et cochez <strong>Graphiques d’arrière-plan</strong>.
            </span>
          </div>
        </div>

        {/* ── Réglages (non imprimés) ── */}
        <aside className="print:hidden">
          <div className="space-y-5 rounded-3xl bg-white p-5 ring-1 ring-black/[0.04] xl:sticky xl:top-6">
            <div>
              <h2 className="text-lg font-semibold text-ink">Personnaliser</h2>
              <p className="mt-0.5 text-xs text-muted">
                Ce que vous enregistrez ici s’applique à toutes vos cartes.
              </p>
            </div>

            <Section titre="Votre logo ou le drapeau" aide="En haut à gauche de la carte.">
              <div className="flex flex-wrap gap-1.5">
                {ENTETES.map((e) => (
                  <button
                    key={e.valeur}
                    onClick={() => changer({ enteteGauche: e.valeur })}
                    className={chip(modele.enteteGauche === e.valeur)}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              {modele.enteteGauche === "logo" && (
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => fichierRef.current?.click()} className={btnSoft}>
                    <ImagePlus className="size-4" />
                    {logoSrc ? "Changer le logo" : "Choisir mon logo"}
                  </button>
                  {logoSrc && (
                    <button onClick={retirerLogo} className={btnMuted}>
                      <Trash2 className="size-4" /> Retirer
                    </button>
                  )}
                </div>
              )}
              <input
                ref={fichierRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={choisirLogo}
                className="hidden"
              />
              <ChampTexte
                label="Titre en haut"
                valeur={modele.titre}
                onChange={(v) => changer({ titre: v })}
                max={40}
                placeholder="Laissez vide pour ne rien afficher"
              />
              <ChampTexte
                label="Petite phrase sous le titre"
                valeur={modele.devise}
                onChange={(v) => changer({ devise: v })}
                max={50}
                placeholder="Laissez vide pour ne rien afficher"
              />
              <Interrupteur
                actif={modele.embleme}
                onChange={(v) => changer({ embleme: v })}
                label="Armoiries du Mali (en haut à droite)"
              />
            </Section>

            <Section titre="Bannière colorée">
              <ChampTexte
                label="Nom de votre entreprise"
                valeur={nom}
                onChange={(v) => {
                  setNom(v);
                  setMessage(null);
                }}
                max={80}
              />
              <ChampTexte
                label="Texte à droite de la bannière"
                valeur={modele.sousTitre}
                onChange={(v) => changer({ sousTitre: v })}
                max={30}
                placeholder="Laissez vide pour ne rien afficher"
              />
            </Section>

            <Section titre="Informations affichées" aide="Le nom et le prénom sont toujours affichés.">
              {CHAMPS.map((c) => (
                <Interrupteur
                  key={c.cle}
                  actif={modele.champs[c.cle]}
                  onChange={(v) => changerChamp(c.cle, v)}
                  label={c.label}
                />
              ))}
            </Section>

            <Section titre="Couleur de la carte">
              <div className="flex flex-wrap gap-3">
                {COULEUR_IDS.map((id) => (
                  <button
                    key={id}
                    onClick={() => changer({ couleur: id })}
                    aria-label={COULEURS[id].nom}
                    title={COULEURS[id].nom}
                    className={cn(
                      "size-10 rounded-full ring-offset-2 transition",
                      modele.couleur === id ? "ring-2 ring-ink" : "hover:scale-105"
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${COULEURS[id].fonce}, ${COULEURS[id].clair})`,
                    }}
                  />
                ))}
              </div>
            </Section>

            {message && (
              <p
                role="status"
                className={cn(
                  "flex items-start gap-2 rounded-2xl px-4 py-3 text-sm",
                  message.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                )}
              >
                {message.ok && <Check className="mt-0.5 size-4 shrink-0" />}
                {message.texte}
              </p>
            )}

            <div className="space-y-2">
              <button
                onClick={enregistrer}
                disabled={!modifie || envoi || nom.trim() === ""}
                className={`${btnPrimary} w-full`}
              >
                {envoi ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Enregistrement…
                  </>
                ) : modifie ? (
                  "Enregistrer pour mes prochaines cartes"
                ) : (
                  "Tout est enregistré"
                )}
              </button>
              <button
                onClick={() => {
                  setModele(MODELE_PAR_DEFAUT);
                  setMessage(null);
                }}
                className={`${btnMuted} w-full`}
              >
                <RotateCcw className="size-4" /> Revenir au modèle d’origine
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}