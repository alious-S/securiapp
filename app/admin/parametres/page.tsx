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

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-lg shadow p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom de l&apos;organisation
          </label>
          <input
            type="text"
            value={nomOrganisation}
            onChange={(e) => setNomOrganisation(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Affiché sur les cartes générées.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Durée de validité par défaut (jours)
          </label>
          <input
            type="number"
            min={1}
            value={dureeValiditeJours}
            onChange={(e) => setDureeValiditeJours(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Utilisé comme suggestion par défaut lors du renouvellement d&apos;une carte.
          </p>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enregistrer
        </button>
        {saved && (
          <span className="ml-3 text-green-600 text-sm">✓ Enregistré</span>
        )}
      </form>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="font-semibold mb-3">À propos</h2>
        <p className="text-sm text-gray-600">
          SecuriApp — Système de vérification d&apos;identité des agents de
          sécurité.
        </p>
        <p className="text-xs text-gray-400 mt-2">Version démo — 2026</p>
      </div>
    </div>
  );
}