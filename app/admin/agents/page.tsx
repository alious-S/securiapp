"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Agent = {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  agence: string;
  actif: boolean;
  photoUrl: string | null;
  cards: { statut: string }[];
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recherche, setRecherche] = useState("");
  const [filtreActif, setFiltreActif] = useState("tous");
  const [loading, setLoading] = useState(true);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/agents");
    const data: Agent[] = await res.json();
    setAgents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  async function toggleActif(agent: Agent) {
    await fetch(`/api/agents/${agent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !agent.actif }),
    });
    loadAgents();
  }

  const agentsFiltres = agents.filter((a) => {
    const matchRecherche =
      !recherche ||
      `${a.nom} ${a.prenom} ${a.matricule}`
        .toLowerCase()
        .includes(recherche.toLowerCase());
    const matchActif =
      filtreActif === "tous" ||
      (filtreActif === "actif" && a.actif) ||
      (filtreActif === "inactif" && !a.actif);
    return matchRecherche && matchActif;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des agents</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Rechercher un agent..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="border rounded px-3 py-2 flex-1 min-w-[250px]"
        />
        <div className="flex gap-2">
          {["tous", "actif", "inactif"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltreActif(f)}
              className={`px-3 py-1.5 rounded text-sm capitalize ${
                filtreActif === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f === "tous" ? "Tous" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Chargement...</p>
        ) : agentsFiltres.length === 0 ? (
          <p className="p-6 text-center text-gray-500">Aucun agent trouvé.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Matricule</th>
                <th className="px-4 py-3">Agence</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {agentsFiltres.map((agent) => (
                <tr key={agent.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    {agent.photoUrl ? (
                      <img
                        src={agent.photoUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                        {agent.prenom[0]}
                        {agent.nom[0]}
                      </div>
                    )}
                    {agent.prenom} {agent.nom}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {agent.matricule}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{agent.agence}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        agent.actif
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {agent.actif ? "actif" : "inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-3">
                    <button
                      onClick={() => toggleActif(agent)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {agent.actif ? "Désactiver" : "Activer"}
                    </button>
                    {agent.cards[0] && (
                      <Link
                        href={`/admin/cartes`}
                        className="text-sm text-gray-500 hover:underline"
                      >
                        Voir carte
                      </Link>
                    )}
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