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
        alert("Choisissez une date d'expiration pour le renouvellement.");
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

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!card) return <div className="p-8">Carte introuvable.</div>;

  return (
    <div className="p-8 max-w-3xl">
      <button
        onClick={() => router.push("/admin/cartes")}
        className="text-blue-600 hover:underline mb-4 text-sm"
      >
        ← Retour à la liste
      </button>

      <h1 className="text-2xl font-bold mb-6">
        {card.agent.prenom} {card.agent.nom}
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
  <div className="flex items-center justify-between gap-4 mb-4">
    <div className="flex items-center gap-4">
      {card.agent.photoUrl ? (
        <img
          src={card.agent.photoUrl}
          alt="Photo"
          className="w-20 h-20 rounded-full object-cover border"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
          {card.agent.prenom[0]}
          {card.agent.nom[0]}
        </div>
      )}
      <div>
        <p className="text-gray-600">Matricule : {card.agent.matricule}</p>
        <p className="text-gray-600">Agence : {card.agent.agence}</p>
      </div>
    </div>

    {qrCodeUrl && (
      <div className="text-center">
        <img
          src={qrCodeUrl}
          alt="QR Code"
          className="w-28 h-28 border rounded"
        />
        <a
          href={`/carte/${card.token}`}
          target="_blank"
          className="text-xs text-blue-600 hover:underline mt-1 block"
        >
          Imprimer →
        </a>
      </div>
    )}
  </div>

        <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
          <div>
            <p className="text-gray-500">Statut actuel</p>
            <p className="font-medium capitalize">{card.statut}</p>
          </div>
          <div>
            <p className="text-gray-500">Expiration</p>
            <p className="font-medium">
              {card.expireAt
                ? new Date(card.expireAt).toLocaleDateString("fr-FR")
                : "Sans expiration"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Créée le</p>
            <p className="font-medium">
              {new Date(card.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Token</p>
            <p className="font-mono text-xs break-all">{card.token}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => appliquerAction("activer")}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            Activer
          </button>
          <button
            onClick={() => appliquerAction("desactiver")}
            className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
          >
            Désactiver
          </button>
          <button
            onClick={() => {
              if (confirm("Révoquer définitivement cette carte ?")) {
                appliquerAction("revoquer");
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
          >
            Révoquer
          </button>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center gap-3">
          <input
            type="date"
            value={nouvelleExpiration}
            onChange={(e) => setNouvelleExpiration(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={() => appliquerAction("renouveler")}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Renouveler avec cette date
          </button>
        </div>
      </div>

      {/* Historique des scans */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4">Derniers scans</h2>
        {card.logs.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun scan enregistré.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {card.logs.map((log) => (
              <li key={log.id} className="flex justify-between border-b pb-2">
                <span>
                  {new Date(log.scannedAt).toLocaleString("fr-FR")}
                </span>
                <span
                  className={
                    log.resultat === "valide"
                      ? "text-green-600"
                      : "text-red-600"
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