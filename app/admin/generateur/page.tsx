"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

type Agent = {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  agence: string;
  cards: { token: string; statut: string }[];
};

export default function GenerateurPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [lastMatricule, setLastMatricule] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    agence: "",
  });

  async function loadAgents() {
    const res = await fetch("/api/agents");
    setAgents(await res.json());
  }

  useEffect(() => {
    loadAgents();
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setQrCodeUrl(null);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photoUrl: photoPreview }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de la création");
      }

      const agent = await res.json();
      const token = agent.cards[0].token;
      setLastToken(token);
      setLastMatricule(agent.matricule);

      const verifyUrl = `${window.location.origin}/v/${token}`;
      setQrCodeUrl(await QRCode.toDataURL(verifyUrl, { width: 300 }));

      setForm({ nom: "", prenom: "", agence: "" });
      setPhotoPreview(null);
      loadAgents();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de l'agent"
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-3 py-2 outline-none focus:border-indigo-500";

  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 md:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">
        Générateur de carte
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl border-l-4 border-indigo-500 p-6">
          <h2 className="font-semibold text-white mb-4">
            Créer un nouvel agent
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Aperçu"
                  className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 text-xs text-center">
                  Pas de photo
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-700"
                >
                  📁 Choisir un fichier
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="text-sm bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-700"
                >
                  📷 Prendre une photo
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            <input
              type="text"
              placeholder="Nom"
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Prénom"
              required
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Agence"
              required
              value={form.agence}
              onChange={(e) => setForm({ ...form, agence: e.target.value })}
              className={inputClass}
            />

            <p className="text-xs text-slate-500">
              🔢 Le matricule sera généré automatiquement.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-500 disabled:opacity-50 font-medium"
            >
              {loading ? "Création..." : "Créer l'agent"}
            </button>
          </form>

          {qrCodeUrl && (
            <div className="mt-6 text-center border-t border-slate-800 pt-6">
              <p className="text-sm text-slate-400 mb-1">
                Matricule généré :{" "}
                <span className="text-white font-semibold">
                  {lastMatricule}
                </span>
              </p>
              <p className="text-sm text-slate-400 mb-2">
                QR code de la carte générée :
              </p>
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="mx-auto rounded-lg bg-white p-2"
              />
              <a
                href={`/carte/${lastToken}`}
                target="_blank"
                className="inline-block mt-3 text-indigo-400 hover:text-indigo-300 text-sm"
              >
                Voir / imprimer la carte physique →
              </a>
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-2xl border-l-4 border-cyan-500 p-6">
          <h2 className="font-semibold text-white mb-4">
            Agents enregistrés ({agents.length})
          </h2>
          <div className="space-y-3 max-h-125 overflow-y-auto">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="border border-slate-800 rounded-lg p-3 text-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-white">
                    {agent.prenom} {agent.nom}
                  </p>
                  <p className="text-slate-500">
                    {agent.matricule} — {agent.agence}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      agent.cards[0]?.statut === "actif"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {agent.cards[0]?.statut}
                  </span>
                  {agent.cards[0]?.token && (
                    <a
                      href={`/carte/${agent.cards[0].token}`}
                      target="_blank"
                      className="text-indigo-400 hover:text-indigo-300 text-xs whitespace-nowrap"
                    >
                      🖨️ Imprimer
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}