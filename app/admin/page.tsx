"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalCartes: number;
  cartesActives: number;
  cartesExpirees: number;
  cartesSuspendues: number;
  nombreAgents: number;
  verifsAujourdhui: number;
  verifsSemaine: number;
};

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total cartes"
          value={stats.totalCartes}
          color="text-slate-800"
        />
        <StatCard
          label="Cartes actives"
          value={stats.cartesActives}
          color="text-green-600"
        />
        <StatCard
          label="Cartes expirées"
          value={stats.cartesExpirees}
          color="text-orange-600"
        />
        <StatCard
          label="Cartes suspendues"
          value={stats.cartesSuspendues}
          color="text-red-600"
        />
        <StatCard
          label="Nombre d'agents"
          value={stats.nombreAgents}
          color="text-blue-600"
        />
        <StatCard
          label="Vérifications aujourd'hui"
          value={stats.verifsAujourdhui}
          color="text-purple-600"
        />
        <StatCard
          label="Vérifications cette semaine"
          value={stats.verifsSemaine}
          color="text-indigo-600"
        />
      </div>
    </div>
  );
}