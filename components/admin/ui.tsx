
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Search } from "lucide-react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ---------- Boutons & champs ---------- */

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export const btnPrimary = `${btnBase} bg-brand-800 text-white hover:bg-brand-900`;
export const btnOutline = `${btnBase} border border-brand-800/70 text-brand-800 hover:bg-brand-50`;
export const btnSoft = `${btnBase} bg-brand-50 text-brand-800 hover:bg-brand-100`;
export const btnDanger = `${btnBase} bg-rose-50 text-rose-700 hover:bg-rose-100`;
export const btnMuted = `${btnBase} bg-black/[0.05] text-ink hover:bg-black/[0.08]`;

export const inputClass =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export const chip = (active: boolean) =>
  cn(
    "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
    active
      ? "bg-brand-800 text-white"
      : "bg-black/[0.04] text-muted hover:text-ink"
  );

/* ---------- Structure ---------- */

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(16,26,20,0.04)] ring-1 ring-black/[0.04]",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

/* ---------- Statuts ---------- */

type Tone = "green" | "amber" | "rose" | "slate";

const tones: Record<Tone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

export function Pill({
  tone = "slate",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone]
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function etatCarte(
  statut: string,
  expireAt: string | Date | null
): { label: string; tone: Tone } {
  if (statut === "revoque") return { label: "Révoquée", tone: "rose" };
  if (statut === "desactive") return { label: "Désactivée", tone: "slate" };
  if (expireAt && new Date(expireAt) < new Date())
    return { label: "Expirée", tone: "amber" };
  return { label: "Active", tone: "green" };
}

/* ---------- Divers ---------- */

export function Avatar({
  photoUrl,
  prenom,
  nom,
  className,
}: {
  photoUrl?: string | null;
  prenom?: string;
  nom?: string;
  className?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800",
        className
      )}
    >
      {prenom?.[0]}
      {nom?.[0]}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-black/[0.06]", className)} />
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card className="p-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </Card>
  );
}

export function EmptyState({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text?: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-xs text-sm text-muted">{text}</p>}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, "pl-10")}
      />
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
  hero,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href: string;
  hero?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[148px] flex-col justify-between overflow-hidden rounded-3xl p-5",
        hero
          ? "bg-linear-to-br from-brand-600 to-brand-900 text-white"
          : "bg-white ring-1 ring-black/[0.04]"
      )}
    >
      {hero && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(120% 90% at 100% 0%, rgba(255,255,255,0.16), transparent 55%)",
          }}
        />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-[15px] font-medium",
            hero ? "text-white/90" : "text-ink"
          )}
        >
          {label}
        </p>
        <Link
          href={href}
          aria-label={`Ouvrir ${label}`}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full border transition hover:scale-105",
            hero
              ? "border-white/60 bg-white text-brand-800"
              : "border-line text-ink hover:bg-brand-50"
          )}
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <div className="relative">
        <p className="text-5xl font-semibold leading-none tracking-tight">
          {value}
        </p>
        {hint && (
          <p
            className={cn(
              "mt-3 text-xs",
              hero ? "text-white/70" : "text-muted"
            )}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Formats ---------- */

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatTime = (d: string | Date) =>
  new Date(d).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });