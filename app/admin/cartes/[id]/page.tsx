"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

type Card = {
  id: string;
  token: string;
  statut: string;
  expireAt: string | null;
  createdAt: string;
  agent: {
    nom: string;
    prenom: string;
    matricule: string;
    agence: string;
    photoUrl: string | null;
  };
  logs: { id: string; resultat: string; scannedAt: string }[];
};

export default function CarteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [nouvelleExpiration, setNouvelleExpiration] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  async function loadCard() {
    const res = await fetch(`/api/cards/${id}`);
    const data = await res.json();
    setCard(data);

    const verifyUrl = `${window.location.origin}/v/${data.token}`;
    const qr = await QRCode.toDataURL(verifyUrl, { width: 220, margin: 1 });
    setQrCodeUrl(qr);

    setLoading(false);
  }

  useEffect(() => {
    loadCard();
  }, [id]);

  async function appliquerAction(action: string) {
    const body: { action: string; expireAt?: string } = { action };
    if (action === "renouveler") {
      if (!nouvelleExpiration) {
        alert("Choisissez une date d'expiration.");
        return;
      }
      body.expireAt = nouvelleExpiration;
    }
    const res = await fetch(`/api/cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      loadCard();
      setNouvelleExpiration("");
    } else {
      alert("Erreur lors de l'action.");
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#0b0f19] p-8 text-white">
        Chargement...
      </div>
    );
  if (!card)
    return (
      <div className="min-h-screen bg-[#0b0f19] p-8 text-white">
        Carte introuvable.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 md:p-8 max-w-3xl">
      <button
        onClick={() => router.push("/admin/cartes")}
        className="text-indigo-400 hover:text-indigo-300 mb-4 text-sm"
      >
        ← Retour à la liste
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">
        {card.agent.prenom} {card.agent.nom}
      </h1>

      <div className="bg-slate-900 rounded-2xl border-l-4 border-indigo-500 p-6 mb-6">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-4">
            {card.agent.photoUrl ? (
              <img
                src={card.agent.photoUrl}
                alt="Photo"
                className="w-20 h-20 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold">
                {card.agent.prenom[0]}
                {card.agent.nom[0]}
              </div>
            )}
            <div>
              <p className="text-slate-400">
                Matricule : {card.agent.matricule}
              </p>
              <p className="text-slate-400">Agence : {card.agent.agence}</p>
            </div>
          </div>

          {qrCodeUrl && (
            <div className="text-center">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-28 h-28 rounded-lg border border-slate-700 bg-white p-1"
              />
              <a
                href={`/carte/${card.token}`}
                target="_blank"
                className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 block"
              >
                Imprimer →
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-800 pt-4">
          <div>
            <p className="text-slate-500">Statut actuel</p>
            <p className="font-medium text-white capitalize">
              {card.statut}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Expiration</p>
            <p className="font-medium text-white">
              {card.expireAt
                ? new Date(card.expireAt).toLocaleDateString("fr-FR")
                : "Sans expiration"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Créée le</p>
            <p className="font-medium text-white">
              {new Date(card.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Token</p>
            <p className="font-mono text-xs text-slate-400 break-all">
              {card.token}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border-l-4 border-emerald-500 p-6 mb-6">
        <h2 className="font-semibold text-white mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => appliquerAction("activer")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-500"
          >
            Activer
          </button>
          <button
            onClick={() => appliquerAction("desactiver")}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600"
          >
            Désactiver
          </button>
          <button
            onClick={() => {
              if (confirm("Révoquer définitivement cette carte ?")) {
                appliquerAction("revoquer");
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-500"
          >
            Révoquer
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={nouvelleExpiration}
            onChange={(e) => setNouvelleExpiration(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => appliquerAction("renouveler")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-500"
          >
            Renouveler avec cette date
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border-l-4 border-pink-500 p-6">
        <h2 className="font-semibold text-white mb-4">Derniers scans</h2>
        {card.logs.length === 0 ? (
          <p className="text-slate-500 text-sm">Aucun scan enregistré.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {card.logs.map((log) => (
              <li
                key={log.id}
                className="flex justify-between border-b border-slate-800 pb-2"
              >
                <span className="text-slate-300">
                  {new Date(log.scannedAt).toLocaleString("fr-FR")}
                </span>
                <span
                  className={
                    log.resultat === "valide"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {log.resultat}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}