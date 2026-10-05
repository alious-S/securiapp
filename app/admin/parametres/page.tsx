"use client";

import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Loader2, TriangleAlert } from "lucide-react";
import {
  Card,
  CardTitle,
  PageHeader,
  Skeleton,
  btnPrimary,
  chip,
  inputClass,
} from "@/components/admin/ui";

const durees = [
  { jours: 90, label: "3 mois" },
  { jours: 180, label: "6 mois" },
  { jours: 365, label: "1 an" },
  { jours: 730, label: "2 ans" },
];

const initiales = (nom: string) =>
  nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "A";

function CompteCard() {
  const [profil, setProfil] = useState<{ nom: string; email: string } | null>(
    null
  );
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [voir, setVoir] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setProfil)
      .catch(() => {});
  }, []);

  async function changer(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (nouveau.length < 8) {
      setMessage({
        ok: false,
        texte: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
      });
      return;
    }
    if (nouveau !== confirmation) {
      setMessage({ ok: false, texte: "Les deux mots de passe ne correspondent pas." });
      return;
    }

    setEnvoi(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actuel, nouveau }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      setActuel("");
      setNouveau("");
      setConfirmation("");
      setMessage({ ok: true, texte: "Mot de passe mis à jour." });
    } catch (err) {
      setMessage({
        ok: false,
        texte: err instanceof Error ? err.message : "Une erreur est survenue.",
      });
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Card>
      <CardTitle
        title="Mon compte"
        subtitle="Vos informations de connexion et votre mot de passe."
      />

      <div className="mb-6 flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-800 text-lg font-semibold text-white">
          {profil ? initiales(profil.nom) : "·"}
        </span>
        {profil ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{profil.nom}</p>
            <p className="truncate text-xs text-muted">{profil.email}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        )}
      </div>

      <form onSubmit={changer} className="space-y-4 border-t border-line pt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Changer le mot de passe</p>
          <button
            type="button"
            onClick={() => setVoir((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-ink"
          >
            {voir ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {voir ? "Masquer" : "Afficher"}
          </button>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Mot de passe actuel
          </span>
          <input
            type={voir ? "text" : "password"}
            autoComplete="current-password"
            required
            value={actuel}
            onChange={(e) => setActuel(e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Nouveau mot de passe
            </span>
            <input
              type={voir ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={nouveau}
              onChange={(e) => setNouveau(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Confirmation
            </span>
            <input
              type={voir ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <p className="text-xs text-muted">8 caractères minimum.</p>

        {message && (
          <div
            role="status"
            className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm ${
              message.ok
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {message.ok ? (
              <Check className="mt-0.5 size-4 shrink-0" />
            ) : (
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            )}
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

export default function ParametresPage() {
  const [nom, setNom] = useState("");
  const [duree, setDuree] = useState(365);
  const [loading, setLoading] = useState(true);
  const [enregistre, setEnregistre] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setNom(d.nomOrganisation);
        setDuree(d.dureeValiditeJours);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomOrganisation: nom, dureeValiditeJours: duree }),
    });
    if (res.ok) {
      setEnregistre(true);
      setTimeout(() => setEnregistre(false), 2000);
    }
  }

  return (
    <>
      <PageHeader
        title="Paramètres"
        subtitle="Réglages généraux et gestion de votre compte."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardTitle title="Général" />
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            ) : (
              <form onSubmit={enregistrer} className="space-y-6">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted">
                    Nom de l’organisation
                  </span>
                  <input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className={inputClass}
                  />
                </label>

                <div>
                  <span className="mb-1.5 block text-xs font-medium text-muted">
                    Durée de validité proposée au renouvellement
                  </span>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {durees.map((d) => (
                      <button
                        type="button"
                        key={d.jours}
                        onClick={() => setDuree(d.jours)}
                        className={chip(duree === d.jours)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative max-w-[220px]">
                    <input
                      type="number"
                      min={1}
                      value={duree}
                      onChange={(e) => setDuree(Number(e.target.value))}
                      className={`${inputClass} pr-16`}
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted">
                      jours
                    </span>
                  </div>
                </div>

                <button type="submit" className={btnPrimary}>
                  {enregistre ? (
                    <>
                      <Check className="size-4" /> Enregistré
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </form>
            )}
          </Card>

          <CompteCard />
        </div>

        <Card className="lg:self-start">
          <CardTitle title="À propos" />
          <p className="text-sm leading-relaxed text-muted">
            SecuriApp permet de vérifier instantanément l’identité des agents de
            sécurité grâce à un QR code imprimé sur leur carte.
          </p>
          <p className="mt-4 text-xs text-muted/70">Version démo · 2026</p>
        </Card>
      </div>
    </>
  );
}