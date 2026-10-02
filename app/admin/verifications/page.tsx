"use client";

import { useEffect, useState, useCallback } from "react";

type Log = {
  id: string;
  resultat: string;
  scannedAt: string;
  ipAddress: string | null;
  card: {
    agent: { nom: string; prenom: string; matricule: string };
  } | null;
};

export default function VerificationsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [periode, setPeriode] = useState("tous");
  const [resultat, setResultat] = useState("tous");
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ periode, resultat });
    const res = await fetch(`/api/verifications?${params.toString()}`);
    setLogs(await res.json());
    setLoading(false);
  }, [periode, resultat]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
  <div className="min-h-screen bg-[#0b0f19] w-full p-4 md:p-8">
  <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Vérifications</h1>

      <div className="bg-slate-900 rounded-2xl border-l-4 border-indigo-500 p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {[
            { value: "tous", label: "Tout" },
            { value: "aujourdhui", label: "Aujourd'hui" },
            { value: "semaine", label: "Cette semaine" },
            { value: "mois", label: "Ce mois" },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriode(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                periode === p.value
                  ? "bg-white text-slate-900 font-semibold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 border-l border-slate-700 pl-4">
          {[
            { value: "tous", label: "Tous résultats" },
            { value: "valide", label: "Valides" },
            { value: "invalide", label: "Invalides" },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setResultat(r.value)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                resultat === r.value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border-l-4 border-cyan-500 overflow-hidden overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-slate-400">Chargement...</p>
        ) : logs.length === 0 ? (
          <p className="p-6 text-center text-slate-400">
            Aucune vérification trouvée pour cette période.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-400 text-left border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Date / Heure</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Résultat</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(log.scannedAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {log.card
                      ? `${log.card.agent.prenom} ${log.card.agent.nom} (${log.card.agent.matricule})`
                      : "— Carte inconnue —"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        log.resultat === "valide"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {log.resultat}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {log.ipAddress || "—"}
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