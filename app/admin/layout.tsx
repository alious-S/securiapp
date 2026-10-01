"use client";

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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-lg font-bold">🛡️ SecuriApp</h1>
          <p className="text-xs text-slate-400 mt-0.5">Administration</p>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
          SecuriApp © 2026
        </div>
      </aside>

      {/* Contenu */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}