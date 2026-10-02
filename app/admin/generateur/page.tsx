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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    matricule: "",
    agence: "",
  });

  async function loadAgents() {
    const res = await fetch("/api/agents");
    const data = await res.json();
    setAgents(data);
  }

  useEffect(() => {
    loadAgents();
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
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

      const verifyUrl = `${window.location.origin}/v/${token}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 300 });
      setQrCodeUrl(qrDataUrl);

      setForm({ nom: "", prenom: "", matricule: "", agence: "" });
      setPhotoPreview(null);
      loadAgents();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de l'agent"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Générateur de carte</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Créer un nouvel agent
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo */}
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Aperçu"
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed flex items-center justify-center text-gray-400 text-xs text-center">
                  Pas de photo
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200"
                >
                  📁 Choisir un fichier
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="text-sm bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200"
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
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Prénom"
              required
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Matricule"
              required
              value={form.matricule}
              onChange={(e) =>
                setForm({ ...form, matricule: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Agence"
              required
              value={form.agence}
              onChange={(e) => setForm({ ...form, agence: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer l'agent"}
            </button>
          </form>

          {qrCodeUrl && (
            <div className="mt-6 text-center border-t pt-6">
              <p className="text-sm text-gray-600 mb-2">
                QR code de la carte générée :
              </p>
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="mx-auto border rounded"
              />
              <a
                href={`/carte/${lastToken}`}
                target="_blank"
                className="inline-block mt-3 text-blue-600 underline text-sm"
              >
                Voir / imprimer la carte physique →
              </a>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Agents enregistrés ({agents.length})
          </h2>
          <div className="space-y-3 max-h-125 overflow-y-auto">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="border rounded p-3 text-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {agent.prenom} {agent.nom}
                  </p>
                  <p className="text-gray-500">
                    {agent.matricule} — {agent.agence}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      agent.cards[0]?.statut === "actif"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {agent.cards[0]?.statut}
                  </span>
                  {agent.cards[0]?.token && (
                    <a
                      href={`/carte/${agent.cards[0].token}`}
                      target="_blank"
                      className="text-blue-600 hover:underline text-xs whitespace-nowrap"
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