"use client";

/**
 * ACTIONS SUR UNE CARTE : agent sur le terrain, pause, retrait, renouvellement.
 * Après chaque action, la page se recharge toute seule avec les nouvelles données.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Pause, Play, RefreshCw } from "lucide-react";
import { Card, CardTitle, btnDanger, btnMuted, btnPrimary, btnSoft, chip, cn, inputClass } from "@/components/admin/ui";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const plusMois = (n: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return iso(d);
};
const plusJours = (n: number) => iso(new Date(Date.now() + n * 86_400_000));

export default function ActionsCarte({
  cardId,
  agentId,
  statut,
  actif,
  dureeDefaut,
}: {
  cardId: string;
  agentId: string;
  statut: string;
  actif: boolean;
  dureeDefaut: number;
}) {
  const router = useRouter();
  const [occupe, setOccupe] = useState(false);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function annoncer(texte: string) {
    setMessage(texte);
    setTimeout(() => setMessage(null), 2400);
  }

  async function envoyer(url: string, corps: object, succes: string) {
    if (occupe) return;
    setOccupe(true);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Une erreur est survenue.");
      }
      annoncer(succes);
      router.refresh();
    } catch (e) {
      annoncer(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setOccupe(false);
    }
  }

  const carte = (action: string, succes: string, extra: object = {}) =>
    envoyer(`/api/cards/${cardId}`, { action, ...extra }, succes);

  const presets = [
    { label: "3 mois", valeur: plusMois(3) },
    { label: "6 mois", valeur: plusMois(6) },
    { label: "1 an", valeur: plusMois(12) },
    { label: `${dureeDefaut} jours`, valeur: plusJours(dureeDefaut) },
  ];

  return (
    <Card>
      <CardTitle title="Gérer cet agent" subtitle="Les changements sont pris en compte tout de suite." />

      {/* Sur le terrain */}
      <button
        type="button"
        role="switch"
        aria-checked={actif}
        disabled={occupe}
        onClick={() => envoyer(`/api/agents/${agentId}`, { actif: !actif }, actif ? "Agent retiré du terrain" : "Agent remis sur le terrain")}
        className="flex w-full items-center justify-between gap-4 rounded-2xl bg-brand-50/60 px-4 py-3 text-left transition hover:bg-brand-50 disabled:opacity-60"
      >
        <span>
          <span className="block text-sm font-semibold text-ink">Agent sur le terrain</span>
          <span className="block text-xs text-muted">
            S’il est absent, retirez-le : sa carte sera refusée lors d’un contrôle.
          </span>
        </span>
        <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", actif ? "bg-brand-600" : "bg-black/15")}>
          <span className={cn("absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform", actif && "translate-x-5")} />
        </span>
      </button>

      {/* État de la carte */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {statut === "actif" ? (
          <button disabled={occupe} onClick={() => carte("desactiver", "Carte mise en pause")} className={btnMuted}>
            <Pause className="size-4" /> Mettre la carte en pause
          </button>
        ) : (
          <button disabled={occupe} onClick={() => carte("activer", "Carte réactivée")} className={btnSoft}>
            <Play className="size-4" /> Réactiver la carte
          </button>
        )}
        {statut !== "revoque" && (
          <button
            disabled={occupe}
            onClick={() => {
              if (confirm("Retirer définitivement cette carte ? Elle sera refusée à tous les contrôles.")) {
                carte("revoquer", "Carte retirée");
              }
            }}
            className={btnDanger}
          >
            <Ban className="size-4" /> Retirer la carte
          </button>
        )}
      </div>

      {/* Renouvellement */}
      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm font-semibold text-ink">Renouveler la carte</p>
        <p className="mt-0.5 text-xs text-muted">Choisissez jusqu’à quand la carte sera valable.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button key={p.label} onClick={() => setDate(p.valeur)} className={chip(date === p.valeur)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} sm:max-w-[220px]`} />
          <button
            disabled={occupe || !date}
            onClick={() => carte("renouveler", "Carte renouvelée", { expireAt: date }).then(() => setDate(""))}
            className={btnPrimary}
          >
            <RefreshCw className="size-4" /> Renouveler
          </button>
        </div>
      </div>

      {message && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {message}
        </div>
      )}
    </Card>
  );
}