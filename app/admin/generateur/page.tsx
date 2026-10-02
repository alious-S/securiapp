"use client";

import { useState, useRef } from "react";
import QRCode from "qrcode";

export default function GenerateurPage() {
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
    <div className="min-h-screen bg-[#0b0f19] w-full p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          Générateur de carte
        </h1>

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

        <a
          href="/admin/agents"
          className="block text-center mt-4 text-sm text-indigo-400 hover:text-indigo-300"
        >
          Voir tous les agents enregistrés →
        </a>
      </div>
    </div>
  );
}