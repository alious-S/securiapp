"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
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
        subtitle="Réglages généraux de votre espace d’administration."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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

        <Card>
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