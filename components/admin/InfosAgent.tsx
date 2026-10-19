"use client";

/** MODIFIER LES INFORMATIONS D'UN AGENT (fermé par défaut pour garder la page claire). */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Card, btnMuted, btnPrimary, btnSoft, chip, inputClass } from "@/components/admin/ui";

type Agent = {
  id: string;
  prenom: string;
  nom: string;
  sexe: string | null;
  fonction: string;
  agence: string;
};

function Champ({ label, valeur, onChange }: { label: string; valeur: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <input required value={valeur} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </label>
  );
}

export default function InfosAgent({ agent }: { agent: Agent }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [f, setF] = useState({
    prenom: agent.prenom,
    nom: agent.nom,
    fonction: agent.fonction,
    agence: agent.agence,
    sexe: agent.sexe ?? "",
  });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, sexe: f.sexe || undefined }),
      });
      if (!res.ok) throw new Error();
      setOuvert(false);
      router.refresh();
    } catch {
      setErreur("Enregistrement impossible. Réessayez.");
    } finally {
      setEnvoi(false);
    }
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className={`${btnSoft} w-full sm:w-auto`}>
        <Pencil className="size-4" /> Modifier les informations
      </button>
    );
  }

  return (
    <Card>
      <p className="mb-4 text-[15px] font-semibold text-ink">Informations de l’agent</p>
      <form onSubmit={enregistrer} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ label="Prénom" valeur={f.prenom} onChange={(v) => setF({ ...f, prenom: v })} />
          <Champ label="Nom" valeur={f.nom} onChange={(v) => setF({ ...f, nom: v })} />
        </div>
        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Sexe</span>
          <div className="flex gap-1.5">
            <button type="button" onClick={() => setF({ ...f, sexe: "M" })} className={chip(f.sexe === "M")}>
              Homme
            </button>
            <button type="button" onClick={() => setF({ ...f, sexe: "F" })} className={chip(f.sexe === "F")}>
              Femme
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ label="Fonction" valeur={f.fonction} onChange={(v) => setF({ ...f, fonction: v })} />
          <Champ label="Agence" valeur={f.agence} onChange={(v) => setF({ ...f, agence: v })} />
        </div>
        {erreur && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{erreur}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={envoi} className={btnPrimary}>
            {envoi ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button type="button" onClick={() => setOuvert(false)} className={btnMuted}>
            Annuler
          </button>
        </div>
      </form>
    </Card>
  );
}