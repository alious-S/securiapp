"use client";

import { useEffect, useState } from "react";

type LogInvalide = {
  id: string;
  scannedAt: string;
  card: {
    statut: string;
    agent: { nom: string; prenom: string; matricule: string };
  };
};

type CarteFrequence = {
  count: number;
  card: { agent: { nom: string; prenom: string; matricule: string } };
};

type AlertesData = {
  cartesInvalidesUtilisees: LogInvalide[];
  cartesFrequenceAnormale: CarteFrequence[];
  tentativesInconnues: number;
};

export default function AlertesPage() {
  const [data, setData] = useState<AlertesData | null>(null);

  useEffect(() => {
    fetch("/api/alertes")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data)
    return (
      <div className="min-h-screen bg-[#0b0f19] p-8 text-white">
        Chargement...
      </div>
    );

  const totalAlertes =
    data.cartesInvalidesUtilisees.length +
    data.cartesFrequenceAnormale.length +
    (data.tentativesInconnues > 10 ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 md:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Alertes</h1>

      {totalAlertes === 0 ? (
        <div className="bg-slate-900 border-l-4 border-green-500 rounded-2xl p-6 text-center text-green-400">
          ✅ Aucune activité suspecte détectée.
        </div>
      ) : (
        <div className="space-y-5">
          {data.cartesInvalidesUtilisees.length > 0 && (
            <div className="bg-slate-900 rounded-2xl border-l-4 border-red-500">
              <div className="p-4 border-b border-slate-800">
                <h2 className="font-semibold text-red-400">
                  ⚠️ Tentatives sur cartes révoquées/désactivées (24h)
                </h2>
              </div>
              <div className="divide-y divide-slate-800">
                {data.cartesInvalidesUtilisees.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 text-sm flex justify-between text-slate-300"
                  >
                    <span>
                      {log.card.agent.prenom} {log.card.agent.nom} (
                      {log.card.agent.matricule}) — carte{" "}
                      <strong className="text-white">
                        {log.card.statut}
                      </strong>
                    </span>
                    <span className="text-slate-500">
                      {new Date(log.scannedAt).toLocaleString("fr-FR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.cartesFrequenceAnormale.length > 0 && (
            <div className="bg-slate-900 rounded-2xl border-l-4 border-orange-500">
              <div className="p-4 border-b border-slate-800">
                <h2 className="font-semibold text-orange-400">
                  ⚠️ Cartes scannées anormalement souvent (1h)
                </h2>
              </div>
              <div className="divide-y divide-slate-800">
                {data.cartesFrequenceAnormale.map((c, i) => (
                  <div
                    key={i}
                    className="p-4 text-sm flex justify-between text-slate-300"
                  >
                    <span>
                      {c.card.agent.prenom} {c.card.agent.nom} (
                      {c.card.agent.matricule})
                    </span>
                    <span className="text-orange-400 font-medium">
                      {c.count} scans
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.tentativesInconnues > 10 && (
            <div className="bg-slate-900 rounded-2xl border-l-4 border-yellow-500 p-4">
              <h2 className="font-semibold text-yellow-400">
                ⚠️ {data.tentativesInconnues} tentatives sur cartes
                inexistantes (24h)
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Possible tentative de deviner des tokens au hasard.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}