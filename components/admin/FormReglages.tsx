"use client";

/** RÉGLAGES : durée de validité par défaut, et changement de mot de passe. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Loader2, TriangleAlert } from "lucide-react";
import { Card, CardTitle, btnPrimary, chip, inputClass } from "@/components/admin/ui";

const DUREES = [
  { jours: 90, label: "3 mois" },
  { jours: 180, label: "6 mois" },
  { jours: 365, label: "1 an" },
  { jours: 730, label: "2 ans" },
];

export function FormValidite({ joursInitial }: { joursInitial: number }) {
  const router = useRouter();
  const [jours, setJours] = useState(joursInitial);
  const [envoi, setEnvoi] = useState(false);
  const [fait, setFait] = useState(false);
  const [erreur, setErreur] = useState(false);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dureeValiditeJours: jours }),
      });
      if (!res.ok) throw new Error();
      setFait(true);
      setTimeout(() => setFait(false), 2000);
      router.refresh();
    } catch {
      setErreur(true);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Card>
      <CardTitle title="Validité des cartes" subtitle="Durée proposée quand vous créez ou renouvelez une carte." />
      <form onSubmit={enregistrer} className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {DUREES.map((d) => (
            <button type="button" key={d.jours} onClick={() => setJours(d.jours)} className={chip(jours === d.jours)}>
              {d.label}
            </button>
          ))}
        </div>
        <div className="relative max-w-[220px]">
          <input
            type="number"
            min={1}
            max={3650}
            value={jours}
            onChange={(e) => setJours(Number(e.target.value))}
            className={`${inputClass} pr-16`}
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted">jours</span>
        </div>
        {erreur && <p className="text-sm text-rose-600">Enregistrement impossible. Entrez un nombre de jours entre 1 et 3650.</p>}
        <button type="submit" disabled={envoi} className={btnPrimary}>
          {fait ? (
            <>
              <Check className="size-4" /> Enregistré
            </>
          ) : (
            "Enregistrer"
          )}
        </button>
      </form>
    </Card>
  );
}

export function FormMotDePasse({ nom, email }: { nom: string; email: string }) {
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [voir, setVoir] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);

  async function changer(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (nouveau.length < 8) return setMessage({ ok: false, texte: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
    if (nouveau !== confirmation) return setMessage({ ok: false, texte: "Les deux mots de passe ne correspondent pas." });

    setEnvoi(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actuel, nouveau }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Une erreur est survenue.");
      setActuel("");
      setNouveau("");
      setConfirmation("");
      setMessage({ ok: true, texte: "Mot de passe mis à jour." });
    } catch (erreur) {
      setMessage({ ok: false, texte: erreur instanceof Error ? erreur.message : "Une erreur est survenue." });
    } finally {
      setEnvoi(false);
    }
  }

  const type = voir ? "text" : "password";
  return (
    <Card>
      <CardTitle title="Mon compte" subtitle={`${nom} · ${email}`} />
      <form onSubmit={changer} className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Changer mon mot de passe</p>
          <button type="button" onClick={() => setVoir((v) => !v)} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink">
            {voir ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {voir ? "Masquer" : "Afficher"}
          </button>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Mot de passe actuel</span>
          <input type={type} autoComplete="current-password" required value={actuel} onChange={(e) => setActuel(e.target.value)} className={inputClass} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Nouveau mot de passe</span>
            <input type={type} autoComplete="new-password" required minLength={8} value={nouveau} onChange={(e) => setNouveau(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Confirmation</span>
            <input type={type} autoComplete="new-password" required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className={inputClass} />
          </label>
        </div>
        <p className="text-xs text-muted">8 caractères minimum.</p>
        {message && (
          <div role="status" className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {message.ok ? <Check className="mt-0.5 size-4 shrink-0" /> : <TriangleAlert className="mt-0.5 size-4 shrink-0" />}
            {message.texte}
          </div>
        )}
        <button type="submit" disabled={envoi} className={btnPrimary}>
          {envoi ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Enregistrement…
            </>
          ) : (
            "Mettre à jour le mot de passe"
          )}
        </button>
      </form>
    </Card>
  );
}