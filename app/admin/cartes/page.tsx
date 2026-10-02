"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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
  };
};

const statutColors: Record<string, string> = {
  actif: "bg-green-100 text-green-700",
  desactive: "bg-gray-200 text-gray-700",
  revoque: "bg-red-100 text-red-700",
};

function estExpiree(card: Card) {
  return card.expireAt && new Date(card.expireAt) < new Date();
}

export default function CartesPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [statutFiltre, setStatutFiltre] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCards = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statutFiltre !== "tous") params.set("statut", statutFiltre);
    if (recherche) params.set("q", recherche);

    const res = await fetch(`/api/cards?${params.toString()}`);
    const data = await res.json();
    setCards(data);
    setLoading(false);
  }, [statutFiltre, recherche]);

  useEffect(() => {
    const timeout = setTimeout(loadCards, 300);
    return () => clearTimeout(timeout);
  }, [loadCards]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des cartes</h1>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Rechercher par nom, prénom, matricule..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="border rounded px-3 py-2 flex-1 min-w-[250px]"
        />
        <div className="flex gap-2">
          {["tous", "actif", "desactive", "revoque"].map((s) => (
            <button
              key={s}
              onClick={() => setStatutFiltre(s)}
              className={`px-3 py-1.5 rounded text-sm capitalize ${
                statutFiltre === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s === "tous" ? "Tous" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
     <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Chargement...</p>
        ) : cards.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            Aucune carte trouvée.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Matricule</th>
                <th className="px-4 py-3">Agence</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Expiration</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {card.agent.prenom} {card.agent.nom}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {card.agent.matricule}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {card.agent.agence}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        estExpiree(card)
                          ? "bg-orange-100 text-orange-700"
                          : statutColors[card.statut]
                      }`}
                    >
                      {estExpiree(card) ? "expirée" : card.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {card.expireAt
                      ? new Date(card.expireAt).toLocaleDateString("fr-FR")
                      : "Sans expiration"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/cartes/${card.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Voir détails →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}