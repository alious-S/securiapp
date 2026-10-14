"use client";

/**
 * CADRE DE L'ADMINISTRATION : menu à gauche (en tiroir sur téléphone)
 * Le menu porte le logo et le nom de l'entreprise du client.
 * Cinq entrées seulement : tout le reste s'atteint depuis ces pages.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IdCard,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Plus,
  ScanLine,
  Settings,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/components/admin/ui";

type Entree = {
  href: string;
  label: string;
  icon: LucideIcon;
  aussi?: string[]; // autres adresses qui gardent cette entrée allumée
  badge?: boolean;
};

const MENU: Entree[] = [
  { href: "/admin", label: "Accueil", icon: LayoutDashboard },
  { href: "/admin/agents", label: "Mes agents", icon: Users, aussi: ["/admin/cartes", "/admin/generateur"] },
  { href: "/admin/verifications", label: "Contrôles", icon: ScanLine, aussi: ["/admin/alertes"], badge: true },
  { href: "/admin/modele-carte", label: "Ma carte", icon: IdCard },
  { href: "/admin/parametres", label: "Réglages", icon: Settings },
];

type Marque = { nomOrganisation: string; aLogo: boolean; version: number };
type Profil = { nom: string; email: string };

const initiales = (nom: string) =>
  nom.split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0]).join("").toUpperCase() || "A";

function Logo({ marque, taille }: { marque: Marque | null; taille: string }) {
  if (marque?.aLogo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/modele-carte/logo?v=${marque.version}`}
        alt=""
        className={cn("shrink-0 rounded-xl bg-white object-contain ring-1 ring-line", taille)}
      />
    );
  }
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-xl bg-brand-800 text-white", taille)}>
      <ShieldCheck className="size-1/2" />
    </span>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [marque, setMarque] = useState<Marque | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [alertes, setAlertes] = useState(0);
  const [sortie, setSortie] = useState(false);

  // Nom et logo de l'entreprise (se met à jour quand on enregistre "Ma carte")
  useEffect(() => {
    const charger = () =>
      fetch("/api/modele-carte?leger=1")
        .then((r) => (r.ok ? r.json() : null))
        .then((m) => m && setMarque(m))
        .catch(() => {});
    charger();
    window.addEventListener("marque-modifiee", charger);
    return () => window.removeEventListener("marque-modifiee", charger);
  }, []);

  // Profil connecté
  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (res.status === 401) return router.replace("/login");
        if (res.ok) setProfil(await res.json());
      })
      .catch(() => {});
  }, [router]);

  // Pastille "à surveiller" sur Contrôles
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

  // Empêche la page de défiler derrière le menu ouvert (téléphone)
  useEffect(() => {
    document.body.style.overflow = ouvert ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [ouvert]);

  const actif = (e: Entree) =>
    e.href === "/admin"
      ? pathname === "/admin"
      : [e.href, ...(e.aussi ?? [])].some((p) => pathname.startsWith(p));

  async function deconnexion() {
    if (sortie) return;
    setSortie(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* on redirige quand même */
    }
    router.replace("/login");
    router.refresh();
  }

  const fermer = () => setOuvert(false);
  const nomEntreprise = marque?.nomOrganisation ?? "SecuriApp";

  return (
    <div className="min-h-screen">
      {/* Barre du haut (téléphone et tablette) */}
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-canvas/90 px-3 py-3 backdrop-blur lg:hidden">
        <button
          onClick={() => setOuvert(true)}
          aria-label="Ouvrir le menu"
          className="grid size-11 place-items-center rounded-full bg-white ring-1 ring-black/[0.05]"
        >
          <Menu className="size-5" />
        </button>
        <Logo marque={marque} taille="size-9" />
        <span className="truncate text-base font-semibold text-ink">{nomEntreprise}</span>
      </header>

      <div
        onClick={fermer}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity lg:hidden",
          ouvert ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed bottom-3 left-3 top-3 z-50 flex w-64 flex-col rounded-3xl bg-white p-4 ring-1 ring-black/[0.04] transition-transform duration-300 ease-out lg:translate-x-0",
          ouvert ? "translate-x-0 shadow-[0_8px_40px_rgba(16,26,20,0.18)]" : "-translate-x-[120%]"
        )}
      >
        <div className="flex items-center gap-3 px-1 pb-4">
          <Logo marque={marque} taille="size-11" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight text-ink">{nomEntreprise}</p>
            <p className="text-xs text-muted">Contrôle des agents</p>
          </div>
          <button
            onClick={fermer}
            aria-label="Fermer le menu"
            className="grid size-8 place-items-center rounded-full text-muted hover:bg-black/[0.05] lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <Link
          href="/admin/generateur"
          onClick={fermer}
          className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-brand-800 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 active:scale-[0.98]"
        >
          <Plus className="size-4" /> Nouvel agent
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {MENU.map((e) => {
            const Icone = e.icon;
            const allume = actif(e);
            return (
              <Link
                key={e.href}
                href={e.href}
                onClick={fermer}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] transition-colors",
                  allume
                    ? "bg-brand-50 font-semibold text-brand-800"
                    : "font-medium text-muted hover:bg-black/[0.03] hover:text-ink"
                )}
              >
                <Icone className={cn("size-5", allume ? "text-brand-700" : "text-muted")} strokeWidth={allume ? 2.2 : 1.8} />
                <span className="flex-1">{e.label}</span>
                {e.badge && alertes > 0 && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-semibold leading-none text-white">
                    {alertes > 9 ? "9+" : alertes}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-3 flex items-center gap-3 border-t border-line pt-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
            {profil ? initiales(profil.nom) : "·"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{profil?.nom ?? "…"}</p>
            <p className="truncate text-xs text-muted">{profil?.email}</p>
          </div>
          <button
            onClick={deconnexion}
            disabled={sortie}
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
          >
            {sortie ? <Loader2 className="size-[18px] animate-spin" /> : <LogOut className="size-[18px]" />}
          </button>
        </div>
      </aside>

      <main className="lg:pl-[16.75rem]">
        <div className="mx-3 min-w-0 pb-12 pt-3 lg:pt-8">
          <div key={pathname} className="page-enter mx-auto w-full max-w-[1100px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}