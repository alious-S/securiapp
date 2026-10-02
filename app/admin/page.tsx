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
};

const COULEURS = ["#6366f1", "#f97316", "#ef4444"];

function StatCard({
  label,
  value,
  bordure,
}: {
  label: string;
  value: number | string;
  bordure: string;
}) {
  return (
    <div
      className="bg-slate-900 rounded-xl p-4 border-t-4"
      style={{ borderTopColor: bordure }}
    >
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
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
    return (
      <div className="min-h-screen bg-[#0b0f19] p-4 md:p-8 text-white">
        Chargement...
      </div>
    );
  }

  const dataDonut = [
    { name: "Actives", value: stats.cartesActives },
    { name: "Expirées", value: stats.cartesExpirees },
    { name: "Suspendues", value: stats.cartesSuspendues },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Dashboard Overview
      </h1>

      {/* Ligne de petites stats, bordure du haut colorée */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="Total cartes" value={stats.totalCartes} bordure="#6366f1" />
        <StatCard label="Cartes actives" value={stats.cartesActives} bordure="#22c55e" />
        <StatCard label="Expirées" value={stats.cartesExpirees} bordure="#f97316" />
        <StatCard label="Suspendues" value={stats.cartesSuspendues} bordure="#ef4444" />
        <StatCard label="Agents" value={stats.nombreAgents} bordure="#06b6d4" />
        <StatCard label="Scans aujourd'hui" value={stats.verifsAujourdhui} bordure="#ec4899" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Donut */}
        <div className="bg-slate-900 rounded-2xl p-5 border-l-4 border-indigo-500">
          <p className="font-semibold text-white mb-3">
            Répartition des cartes
          </p>
          <div className="relative h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataDonut}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {dataDonut.map((_, i) => (
                    <Cell key={i} fill={COULEURS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xl font-bold text-white">
                {stats.totalCartes}
              </p>
              <p className="text-xs text-slate-400">cartes</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-3 text-xs">
            {dataDonut.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COULEURS[i] }}
                />
                <span className="text-slate-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-slate-900 rounded-2xl p-5 border-l-4 border-cyan-500 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-white">
              Vérifications (7 derniers jours)
            </p>
            <span className="text-xs text-slate-400">
              Semaine :{" "}
              <strong className="text-white">{stats.verifsSemaine}</strong>
            </span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.verifsParJour}>
                <XAxis
                  dataKey="jour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
                <Bar dataKey="total" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Agents */}
      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <div className="bg-slate-900 rounded-2xl p-5 border-l-4 border-emerald-500">
          <p className="text-slate-400 text-sm mb-3">Agents</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg">
              👥
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.nombreAgents}
              </p>
              <p className="text-xs text-slate-400">total enregistrés</p>
            </div>
          </div>
          <Link
            href="/admin/agents"
            className="block text-center bg-white text-slate-900 font-medium text-sm rounded-lg py-2 hover:bg-slate-100"
          >
            Voir tous les agents
          </Link>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border-l-4 border-pink-500 lg:col-span-2">
          <p className="font-semibold text-white mb-3">
            Derniers agents ajoutés
          </p>
          <div className="space-y-1">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                    {agent.prenom[0]}
                    {agent.nom[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {agent.prenom} {agent.nom}
                    </p>
                    <p className="text-xs text-slate-500">
                      {agent.matricule}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    agent.actif
                      ? "bg-green-500/20 text-green-400"
                      : "bg-slate-700 text-slate-400"
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