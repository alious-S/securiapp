"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ScanLine,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { btnPrimary, cn, inputClass } from "@/components/admin/ui";

const points = [
  { icon: ScanLine, texte: "Vérification instantanée par QR code" },
  {
    icon: BadgeCheck,
    texte: "Cartes activées, suspendues ou révoquées en un clic",
  },
  { icon: TriangleAlert, texte: "Alertes sur les activités suspectes" },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "";
  // On n'accepte que les chemins internes (évite les redirections externes)
  const destination =
    from.startsWith("/") && !from.startsWith("//") ? from : "/admin";

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [voir, setVoir] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErreur(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: motDePasse }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Connexion impossible.");
      router.replace(destination);
      router.refresh();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Connexion impossible.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">
          Adresse email
        </span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="email"
            autoComplete="email"
            autoFocus
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className={cn(inputClass, "pl-10")}
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">
          Mot de passe
        </span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type={voir ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={loading}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="••••••••"
            className={cn(inputClass, "pl-10 pr-11")}
          />
          <button
            type="button"
            onClick={() => setVoir((v) => !v)}
            aria-label={voir ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-black/[0.05] hover:text-ink"
          >
            {voir ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>

      {erreur && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {erreur}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email || !motDePasse}
        className={cn(btnPrimary, "w-full")}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Connexion…
          </>
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-canvas p-3 lg:p-4">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white ring-1 ring-black/[0.04] lg:min-h-[calc(100dvh-2rem)] lg:grid-cols-2">
        {/* Panneau de marque (ordinateur) */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-brand-700 to-brand-900 p-10 text-white lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-radial-gradient(circle at 100% 100%, rgba(255,255,255,0.07) 0 1px, transparent 1px 16px)",
            }}
          />
          <div className="relative flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-white/15">
              <ShieldCheck className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              SecuriApp
            </span>
          </div>

          <div className="relative">
            <h2 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight">
              Chaque agent, vérifié en un scan.
            </h2>
            <ul className="mt-8 space-y-4">
              {points.map(({ icon: Icon, texte }) => (
                <li key={texte} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/12">
                    <Icon className="size-4" />
                  </span>
                  {texte}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/60">
            Espace réservé aux administrateurs.
          </p>
        </div>

        {/* Formulaire */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-800 text-white">
                <ShieldCheck className="size-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-ink">
                SecuriApp
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-ink">
              Connexion
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Accédez à votre espace d’administration.
            </p>

            <Suspense fallback={<div className="mt-8 h-56" />}>
              <LoginForm />
            </Suspense>

            <p className="mt-8 text-center text-xs text-muted/80">
              SecuriApp © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}