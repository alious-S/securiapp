"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  IdCard,
  LayoutDashboard,
  Menu,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  SquarePlus,
  TriangleAlert,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/components/admin/ui";

type NavEntry = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: boolean;
};

const menu: NavEntry[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cartes", label: "Cartes", icon: IdCard },
  { href: "/admin/agents", label: "Agents", icon: Users },
  { href: "/admin/verifications", label: "Vérifications", icon: ScanLine },
  { href: "/admin/alertes", label: "Alertes", icon: TriangleAlert, badge: true },
];

const general: NavEntry[] = [
  { href: "/admin/generateur", label: "Générateur", icon: SquarePlus },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

function NavItem({
  item,
  active,
  count,
  onNavigate,
}: {
  item: NavEntry;
  active: boolean;
  count: number;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active
          ? "font-semibold text-brand-800"
          : "font-medium text-muted hover:bg-black/[0.03] hover:text-ink"
      )}
    >
      {active && (
        <span className="absolute -left-4 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-brand-700" />
      )}
      <Icon
        className={cn(
          "size-[18px] transition-colors",
          active ? "text-brand-700" : "text-muted group-hover:text-ink"
        )}
        strokeWidth={active ? 2.2 : 1.8}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge && count > 0 && (
        <span className="rounded-full bg-brand-800 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [alertes, setAlertes] = useState(0);

  // Nombre d'alertes (badge)
  useEffect(() => {
    let actif = true;
    async function charger() {
      try {
        const res = await fetch("/api/alertes");
        if (!res.ok) return;
        const d = await res.json();
        const n =
          (d.cartesInvalidesUtilisees?.length ?? 0) +
          (d.cartesFrequenceAnormale?.length ?? 0) +
          (d.tentativesInconnues > 10 ? 1 : 0);
        if (actif) setAlertes(n);
      } catch {
        /* ignoré */
      }
    }
    charger();
    const id = setInterval(charger, 60000);
    return () => {
      actif = false;
      clearInterval(id);
    };
  }, []);

  // Bloque le scroll de la page quand le tiroir mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = recherche.trim();
    router.push(q ? `/admin/cartes?q=${encodeURIComponent(q)}` : "/admin/cartes");
  }

  const fermer = () => setOpen(false);

  return (
    <div className="min-h-screen">
      {/* Fond assombri (mobile) */}
      <div
        onClick={fermer}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Menu vertical */}
      <aside
        className={cn(
          "fixed bottom-3 left-3 top-3 z-50 flex w-64 flex-col rounded-3xl bg-white p-4 ring-1 ring-black/[0.04] transition-transform duration-300 ease-out lg:translate-x-0",
          open
            ? "translate-x-0 shadow-[0_8px_40px_rgba(16,26,20,0.18)]"
            : "-translate-x-[120%]"
        )}
      >
        <div className="flex items-center justify-between px-2 pb-6 pt-2">
          <Link href="/admin" onClick={fermer} className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-800 text-white">
              <ShieldCheck className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-ink">
              SecuriApp
            </span>
          </Link>
          <button
            onClick={fermer}
            aria-label="Fermer le menu"
            className="grid size-8 place-items-center rounded-full text-muted hover:bg-black/[0.05] lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto">
          <div>
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted/80">
              MENU
            </p>
            <div className="space-y-0.5">
              {menu.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  count={alertes}
                  onNavigate={fermer}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted/80">
              GÉNÉRAL
            </p>
            <div className="space-y-0.5">
              {general.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  count={0}
                  onNavigate={fermer}
                />
              ))}
            </div>
          </div>
        </nav>

        <div className="relative mt-4 shrink-0 overflow-hidden rounded-2xl bg-linear-to-br from-brand-700 to-brand-900 p-4 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-radial-gradient(circle at 100% 100%, rgba(255,255,255,0.07) 0 1px, transparent 1px 14px)",
            }}
          />
          <p className="relative text-sm font-semibold">Nouvelle carte</p>
          <p className="relative mt-1 text-xs leading-relaxed text-white/70">
            Créez un agent et imprimez sa carte en quelques secondes.
          </p>
          <Link
            href="/admin/generateur"
            onClick={fermer}
            className="relative mt-3 flex items-center justify-center gap-1.5 rounded-full bg-white/15 py-2 text-xs font-medium transition hover:bg-white/25"
          >
            Créer une carte <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </aside>

      {/* Zone principale */}
      <div className="lg:pl-[16.75rem]">
        <header className="sticky top-3 z-30 mx-3 mt-3 flex items-center gap-3 rounded-3xl bg-white px-3 py-2.5 ring-1 ring-black/[0.04]">
          <button
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="grid size-10 shrink-0 place-items-center rounded-full text-ink hover:bg-black/[0.05] lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <form onSubmit={onSearch} className="relative min-w-0 max-w-md flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un agent, un matricule…"
              className="h-11 w-full rounded-full bg-canvas/60 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-muted focus:bg-white focus:ring-2 focus:ring-brand-200"
            />
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/alertes"
              aria-label="Alertes"
              className="relative grid size-10 place-items-center rounded-full border border-line text-ink transition hover:bg-brand-50"
            >
              <Bell className="size-[18px]" />
              {alertes > 0 && (
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </Link>
            <div className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 sm:pr-3">
              <span className="grid size-10 place-items-center rounded-full bg-brand-800 text-sm font-semibold text-white">
                A
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-semibold text-ink">Administrateur</p>
                <p className="text-xs text-muted">SecuriApp</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-3 min-w-0 pb-10 pt-6">
          <div
            key={pathname}
            className="page-enter mx-auto w-full max-w-[1400px]"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}