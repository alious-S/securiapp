"use client";

import { useEffect, useState, useCallback } from "react";

type Log = {
  id: string;
  resultat: string;
  scannedAt: string;
  ipAddress: string | null;
  card: {
    agent: {
      nom: string;
      prenom: string;
      matricule: string;
    };
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
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  }, [periode, resultat]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Vérifications</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
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
              className={`px-3 py-1.5 rounded text-sm ${
                periode === p.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 border-l pl-4">
          {[
            { value: "tous", label: "Tous résultats" },
            { value: "valide", label: "Valides" },
            { value: "invalide", label: "Invalides" },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setResultat(r.value)}
              className={`px-3 py-1.5 rounded text-sm ${
                resultat === r.value
                  ? "bg-slate-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Chargement...</p>
        ) : logs.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            Aucune vérification trouvée pour cette période.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Date / Heure</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Résultat</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(log.scannedAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {log.card
                      ? `${log.card.agent.prenom} ${log.card.agent.nom} (${log.card.agent.matricule})`
                      : "— Carte inconnue —"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        log.resultat === "valide"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {log.resultat}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {log.ipAddress || "—"}
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