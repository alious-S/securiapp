"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/cartes", label: "Cartes", icon: "🪪" },
  { href: "/admin/agents", label: "Agents", icon: "👥" },
  { href: "/admin/verifications", label: "Vérifications", icon: "✅" },
  { href: "/admin/alertes", label: "Alertes", icon: "⚠️" },
  { href: "/admin/generateur", label: "Générateur", icon: "➕" },
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
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="font-bold text-white hidden sm:inline">
              SecuriApp
            </span>
          </div>

          {/* Menu desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-white text-slate-900 font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
              A
            </div>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 text-slate-300 hover:text-white"
              aria-label="Menu"
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
          </div>
        </div>

        {/* Menu mobile (tiroir déroulant) */}
        {open && (
          <nav className="lg:hidden border-t border-slate-800 px-4 py-2 space-y-1">
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
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                    isActive
                      ? "bg-white text-slate-900 font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
}