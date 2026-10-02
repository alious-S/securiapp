"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

type Stats = {
  totalCartes: number;
  cartesActives: number;
  cartesExpirees: number;
  cartesSuspendues: number;
  nombreAgents: number;
  verifsAujourdhui: number;
  verifsSemaine: number;
  verifsParJour: { jour: string; total: number }[];
};

type Agent = {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  actif: boolean;
  createdAt: string;
};

const COULEURS_STATUT = ["#6366f1", "#f97316", "#ef4444"];

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setStats);
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => setAgents(data.slice(0, 5)));
  }, []);

  if (!stats) {
    return <div className="p-4 md:p-8">Chargement...</div>;
  }

  const dataDonut = [
    { name: "Actives", value: stats.cartesActives },
    { name: "Expirées", value: stats.cartesExpirees },
    { name: "Suspendues", value: stats.cartesSuspendues },
  ];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total cartes"
          value={stats.totalCartes}
          accent="text-slate-800"
        />
        <StatCard
          label="Cartes actives"
          value={stats.cartesActives}
          accent="text-indigo-600"
        />
        <StatCard
          label="Expirées"
          value={stats.cartesExpirees}
          accent="text-orange-500"
        />
        <StatCard
          label="Suspendues"
          value={stats.cartesSuspendues}
          accent="text-red-500"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Donut */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="font-semibold text-slate-800 mb-3">
            Répartition des cartes
          </p>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataDonut}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {dataDonut.map((_, i) => (
                    <Cell key={i} fill={COULEURS_STATUT[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-bold text-slate-800">
                {stats.totalCartes}
              </p>
              <p className="text-xs text-gray-400">cartes</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-3 text-xs">
            {dataDonut.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COULEURS_STATUT[i] }}
                />
                <span className="text-gray-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart vérifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-800">
              Vérifications (7 derniers jours)
            </p>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>
                Aujourd&apos;hui :{" "}
                <strong className="text-slate-700">
                  {stats.verifsAujourdhui}
                </strong>
              </span>
              <span>
                Semaine :{" "}
                <strong className="text-slate-700">
                  {stats.verifsSemaine}
                </strong>
              </span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.verifsParJour}>
                <XAxis
                  dataKey="jour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <Tooltip />
                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Derniers agents + nombre d'agents */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-400">Nombre d&apos;agents</p>
          <p className="text-3xl font-bold mt-2 text-slate-800">
            {stats.nombreAgents}
          </p>
          <Link
            href="/admin/agents"
            className="text-xs text-indigo-600 hover:underline mt-3 inline-block"
          >
            Voir tous les agents →
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:col-span-2">
          <p className="font-semibold text-slate-800 mb-3">
            Derniers agents ajoutés
          </p>
          <div className="space-y-2">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    {agent.prenom[0]}
                    {agent.nom[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {agent.prenom} {agent.nom}
                    </p>
                    <p className="text-xs text-gray-400">
                      {agent.matricule}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    agent.actif
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {agent.actif ? "actif" : "inactif"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}