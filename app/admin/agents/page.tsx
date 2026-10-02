"use client";

import { useEffect, useState, useCallback } from "react";

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
    setAgents(await res.json());
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
   <div className="min-h-screen bg-[#0b0f19] w-full p-4 md:p-8">
  <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        Gestion des agents
      </h1>

      <div className="bg-slate-900 rounded-2xl border-l-4 border-indigo-500 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Rechercher un agent..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-3 py-2 flex-1 min-w-[250px] outline-none focus:border-indigo-500"
        />
        <div className="flex gap-2">
          {["tous", "actif", "inactif"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltreActif(f)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                filtreActif === f
                  ? "bg-white text-slate-900 font-semibold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {f === "tous" ? "Tous" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border-l-4 border-cyan-500 overflow-hidden overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-slate-400">Chargement...</p>
        ) : agentsFiltres.length === 0 ? (
          <p className="p-6 text-center text-slate-400">
            Aucun agent trouvé.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-400 text-left border-b border-slate-800">
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
                <tr
                  key={agent.id}
                  className="border-t border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                    {agent.photoUrl ? (
                      <img
                        src={agent.photoUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                        {agent.prenom[0]}
                        {agent.nom[0]}
                      </div>
                    )}
                    {agent.prenom} {agent.nom}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {agent.matricule}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {agent.agence}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        agent.actif
                          ? "bg-green-500/20 text-green-400"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {agent.actif ? "actif" : "inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleActif(agent)}
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      {agent.actif ? "Désactiver" : "Activer"}
                    </button>
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