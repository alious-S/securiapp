"use client";

import { useEffect, useState } from "react";

export default function ParametresPage() {
  const [nomOrganisation, setNomOrganisation] = useState("");
  const [dureeValiditeJours, setDureeValiditeJours] = useState(365);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setNomOrganisation(data.nomOrganisation);
        setDureeValiditeJours(data.dureeValiditeJours);
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomOrganisation, dureeValiditeJours }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#0b0f19] p-8 text-white">
        Chargement...
      </div>
    );

  const inputClass =
    "w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-indigo-500";

  return (
    <div className="min-h-screen bg-[#0b0f19] w-full p-4 md:p-8">
  <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Paramètres</h1>

      <form
        onSubmit={handleSave}
        className="bg-slate-900 rounded-2xl border-l-4 border-indigo-500 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Nom de l&apos;organisation
          </label>
          <input
            type="text"
            value={nomOrganisation}
            onChange={(e) => setNomOrganisation(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-slate-500 mt-1">
            Affiché sur les cartes générées.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Durée de validité par défaut (jours)
          </label>
          <input
            type="number"
            min={1}
            value={dureeValiditeJours}
            onChange={(e) => setDureeValiditeJours(Number(e.target.value))}
            className={inputClass}
          />
          <p className="text-xs text-slate-500 mt-1">
            Suggestion par défaut lors du renouvellement d&apos;une carte.
          </p>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 font-medium"
        >
          Enregistrer
        </button>
        {saved && (
          <span className="ml-3 text-green-400 text-sm">✓ Enregistré</span>
        )}
      </form>

      <div className="bg-slate-900 rounded-2xl border-l-4 border-cyan-500 p-6 mt-6">
        <h2 className="font-semibold text-white mb-3">À propos</h2>
        <p className="text-sm text-slate-400">
          SecuriApp — Système de vérification d&apos;identité des agents de
          sécurité.
        </p>
        <p className="text-xs text-slate-600 mt-2">Version démo — 2026</p>
      </div>
    </div>
    </div>
  );
}