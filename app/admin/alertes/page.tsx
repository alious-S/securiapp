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
  card: {
    agent: { nom: string; prenom: string; matricule: string };
  };
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

  if (!data) return <div className="p-8">Chargement...</div>;

  const totalAlertes =
    data.cartesInvalidesUtilisees.length +
    data.cartesFrequenceAnormale.length +
    (data.tentativesInconnues > 10 ? 1 : 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Alertes</h1>

      {totalAlertes === 0 ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-6 text-center">
          ✅ Aucune activité suspecte détectée.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cartes révoquées/désactivées utilisées */}
          {data.cartesInvalidesUtilisees.length > 0 && (
            <div className="bg-white rounded-lg shadow border-l-4 border-red-500">
              <div className="p-4 border-b bg-red-50">
                <h2 className="font-semibold text-red-700">
                  ⚠️ Tentatives d'utilisation de cartes révoquées/désactivées (24h)
                </h2>
              </div>
              <div className="divide-y">
                {data.cartesInvalidesUtilisees.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 text-sm flex justify-between"
                  >
                    <span>
                      {log.card.agent.prenom} {log.card.agent.nom} (
                      {log.card.agent.matricule}) — carte{" "}
                      <strong>{log.card.statut}</strong>
                    </span>
                    <span className="text-gray-500">
                      {new Date(log.scannedAt).toLocaleString("fr-FR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fréquence anormale */}
          {data.cartesFrequenceAnormale.length > 0 && (
            <div className="bg-white rounded-lg shadow border-l-4 border-orange-500">
              <div className="p-4 border-b bg-orange-50">
                <h2 className="font-semibold text-orange-700">
                  ⚠️ Cartes scannées anormalement souvent (dernière heure)
                </h2>
              </div>
              <div className="divide-y">
                {data.cartesFrequenceAnormale.map((c, i) => (
                  <div key={i} className="p-4 text-sm flex justify-between">
                    <span>
                      {c.card.agent.prenom} {c.card.agent.nom} (
                      {c.card.agent.matricule})
                    </span>
                    <span className="text-orange-600 font-medium">
                      {c.count} scans en 1h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tentatives inconnues */}
          {data.tentativesInconnues > 10 && (
            <div className="bg-white rounded-lg shadow border-l-4 border-yellow-500">
              <div className="p-4 bg-yellow-50">
                <h2 className="font-semibold text-yellow-700">
                  ⚠️ {data.tentativesInconnues} tentatives sur des cartes
                  inexistantes (24h)
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Possible tentative de deviner des tokens au hasard.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}