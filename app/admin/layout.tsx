"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/cartes", label: "Gestion des cartes", icon: "🪪" },
  { href: "/admin/agents", label: "Gestion des agents", icon: "👥" },
  { href: "/admin/verifications", label: "Vérifications", icon: "✅" },
  { href: "/admin/alertes", label: "Alertes", icon: "⚠️" },
  { href: "/admin/generateur", label: "Générateur de carte", icon: "➕" },
  { href: "/admin/parametres", label: "Paramètres", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre du haut (mobile uniquement) */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Ouvrir le menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <span className="font-bold text-slate-800">🛡️ SecuriApp</span>
        <div className="w-9" />
      </div>

      {/* Fond assombri derrière le menu mobile ouvert */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r z-50 flex flex-col transform transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              🛡️ SecuriApp
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Administration</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? "bg-indigo-600 text-white" : "bg-gray-100"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t text-xs text-gray-400">
          SecuriApp © 2026
        </div>
      </aside>

      {/* Contenu */}
      <main className="md:ml-64">{children}</main>
    </div>
  );
}