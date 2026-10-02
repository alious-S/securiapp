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

const statutStyles: Record<string, string> = {
  actif: "bg-green-500/20 text-green-400",
  desactive: "bg-slate-700 text-slate-300",
  revoque: "bg-red-500/20 text-red-400",
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
    setCards(await res.json());
    setLoading(false);
  }, [statutFiltre, recherche]);

  useEffect(() => {
    const t = setTimeout(loadCards, 300);
    return () => clearTimeout(t);
  }, [loadCards]);

  return (<div className="min-h-screen bg-[#0b0f19] w-full p-4 md:p-8">
  <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        Gestion des cartes
      </h1>

      <div className="bg-slate-900 rounded-2xl border-l-4 border-indigo-500 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Rechercher par nom, prénom, matricule..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-3 py-2 flex-1 min-w-[250px] outline-none focus:border-indigo-500"
        />
        <div className="flex gap-2">
          {["tous", "actif", "desactive", "revoque"].map((s) => (
            <button
              key={s}
              onClick={() => setStatutFiltre(s)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                statutFiltre === s
                  ? "bg-white text-slate-900 font-semibold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {s === "tous" ? "Tous" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border-l-4 border-cyan-500 overflow-hidden overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-slate-400">Chargement...</p>
        ) : cards.length === 0 ? (
          <p className="p-6 text-center text-slate-400">
            Aucune carte trouvée.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-400 text-left border-b border-slate-800">
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
                <tr
                  key={card.id}
                  className="border-t border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {card.agent.prenom} {card.agent.nom}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {card.agent.matricule}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {card.agent.agence}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        estExpiree(card)
                          ? "bg-orange-500/20 text-orange-400"
                          : statutStyles[card.statut]
                      }`}
                    >
                      {estExpiree(card) ? "expirée" : card.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {card.expireAt
                      ? new Date(card.expireAt).toLocaleDateString("fr-FR")
                      : "Sans expiration"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/cartes/${card.id}`}
                      className="text-indigo-400 hover:text-indigo-300"
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
    </div>
  );
}