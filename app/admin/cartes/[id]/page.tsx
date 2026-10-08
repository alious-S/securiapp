"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Ban,
  Check,
  ChevronLeft,
  Copy,
  ExternalLink,
  Power,
  PowerOff,
  Printer,
  RefreshCw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import {
  Avatar,
  Card,
  CardTitle,
  PageHeader,
  Pill,
  Skeleton,
  btnDanger,
  btnMuted,
  btnPrimary,
  btnSoft,
  chip,
  etatCarte,
  formatDate,
  formatTime,
  inputClass,
} from "@/components/admin/ui";

type Agent = {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  agence: string;
  photoUrl: string | null;
  sexe: string | null;
  fonction: string;
};

type Detail = {
  id: string;
  token: string;
  statut: string;
  expireAt: string | null;
  createdAt: string;
  issuedAt: string | null;
  agent: Agent;
  logs: { id: string; resultat: string; scannedAt: string }[];
};

type Action = "activer" | "desactiver" | "revoquer" | "renouveler";

const messages: Record<Action, string> = {
  activer: "Carte activée",
  desactiver: "Carte désactivée",
  revoquer: "Carte révoquée",
  renouveler: "Carte renouvelée",
};

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(
    /\/$/,
    ""
  );

const dateISO = (d: Date) => d.toISOString().slice(0, 10);
const plusMois = (n: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return dateISO(d);
};
const plusJours = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dateISO(d);
};

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-1 text-sm font-medium text-ink">{children}</div>
    </div>
  );
}

function InfosAgent({
  agent,
  onSaved,
  notify,
}: {
  agent: Agent;
  onSaved: () => Promise<void>;
  notify: (m: string) => void;
}) {
  const [f, setF] = useState({
    prenom: agent.prenom,
    nom: agent.nom,
    fonction: agent.fonction,
    agence: agent.agence,
    sexe: agent.sexe ?? "",
  });
  const [envoi, setEnvoi] = useState(false);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, sexe: f.sexe || undefined }),
      });
      if (!res.ok) throw new Error();
      await onSaved();
      notify("Informations enregistrées");
    } catch {
      notify("Enregistrement impossible.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Card>
      <CardTitle
        title="Informations de l’agent"
        subtitle="Ces informations sont imprimées sur la carte."
      />
      <form onSubmit={enregistrer} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Prénom
            </span>
            <input
              required
              value={f.prenom}
              onChange={(e) => setF({ ...f, prenom: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Nom
            </span>
            <input
              required
              value={f.nom}
              onChange={(e) => setF({ ...f, nom: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Sexe
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setF({ ...f, sexe: "M" })}
              className={chip(f.sexe === "M")}
            >
              Homme
            </button>
            <button
              type="button"
              onClick={() => setF({ ...f, sexe: "F" })}
              className={chip(f.sexe === "F")}
            >
              Femme
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Fonction
            </span>
            <input
              required
              value={f.fonction}
              onChange={(e) => setF({ ...f, fonction: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Agence
            </span>
            <input
              required
              value={f.agence}
              onChange={(e) => setF({ ...f, agence: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>

        <button type="submit" disabled={envoi} className={btnPrimary}>
          {envoi ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </Card>
  );
}

export default function CarteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [card, setCard] = useState<Detail | null>(null);
  const [introuvable, setIntrouvable] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [expiration, setExpiration] = useState("");
  const [dureeDefaut, setDureeDefaut] = useState(365);
  const [toast, setToast] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  const charger = useCallback(async () => {
    const res = await fetch(`/api/cards/${id}`);
    if (!res.ok) {
      setIntrouvable(true);
      return;
    }
    const data: Detail = await res.json();
    setCard(data);
    setQr(
      await QRCode.toDataURL(`${siteUrl()}/v/${data.token}`, {
        width: 320,
        margin: 1,
      })
    );
  }, [id]);

  useEffect(() => {
    charger();
  }, [charger]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (s?.dureeValiditeJours) setDureeDefaut(s.dureeValiditeJours);
      })
      .catch(() => {});
  }, []);

  function afficherToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  async function appliquer(action: Action) {
    if (action === "renouveler" && !expiration) {
      afficherToast("Choisissez une date d’expiration.");
      return;
    }
    const res = await fetch(`/api/cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        expireAt: action === "renouveler" ? expiration : undefined,
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      afficherToast(d.error || "Une erreur est survenue.");
      return;
    }
    await charger();
    if (action === "renouveler") setExpiration("");
    afficherToast(messages[action]);
  }

  async function copierToken() {
    if (!card) return;
    try {
      await navigator.clipboard.writeText(card.token);
      setCopie(true);
      setTimeout(() => setCopie(false), 1500);
    } catch {
      /* ignoré */
    }
  }

  if (introuvable) {
    return (
      <Card className="py-12 text-center text-sm text-muted">
        Carte introuvable.{" "}
        <Link
          href="/admin/cartes"
          className="font-medium text-brand-700 hover:underline"
        >
          Retour aux cartes
        </Link>
      </Card>
    );
  }

  if (!card) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-3xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  const etat = etatCarte(card.statut, card.expireAt);
  const presets = [
    { label: "3 mois", valeur: plusMois(3) },
    { label: "6 mois", valeur: plusMois(6) },
    { label: "1 an", valeur: plusMois(12) },
    { label: `${dureeDefaut} jours (défaut)`, valeur: plusJours(dureeDefaut) },
  ];

  return (
    <>
      <Link
        href="/admin/cartes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition hover:text-ink"
      >
        <ChevronLeft className="size-4" /> Cartes
      </Link>

      <PageHeader
        title={`${card.agent.prenom} ${card.agent.nom}`}
        subtitle={`${card.agent.matricule} · ${card.agent.fonction}`}
        actions={
          <Link
            href={`/carte/${card.token}`}
            target="_blank"
            className={btnPrimary}
          >
            <Printer className="size-4" /> Imprimer la carte
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex items-center gap-4">
              <Avatar
                photoUrl={card.agent.photoUrl}
                prenom={card.agent.prenom}
                nom={card.agent.nom}
                className="size-20 text-xl"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-lg font-semibold text-ink">
                    {card.agent.prenom} {card.agent.nom}
                  </p>
                  <Pill tone={etat.tone}>{etat.label}</Pill>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {card.agent.sexe === "M"
                    ? "Homme"
                    : card.agent.sexe === "F"
                    ? "Femme"
                    : "Sexe non renseigné"}{" "}
                  · {card.agent.fonction}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
              <Info label="Émise le">
                {formatDate(card.issuedAt ?? card.createdAt)}
              </Info>
              <Info label="Expire le">
                {card.expireAt ? formatDate(card.expireAt) : "Illimitée"}
              </Info>
              <Info label="Jeton">
                <button
                  onClick={copierToken}
                  className="group flex max-w-full items-center gap-1.5 font-mono text-xs text-muted transition hover:text-ink"
                  title="Copier le jeton"
                >
                  <span className="truncate">{card.token}</span>
                  {copie ? (
                    <Check className="size-3.5 shrink-0 text-brand-600" />
                  ) : (
                    <Copy className="size-3.5 shrink-0" />
                  )}
                </button>
              </Info>
            </div>
          </Card>

          <InfosAgent
            key={`${card.agent.id}-${card.agent.sexe}-${card.agent.fonction}`}
            agent={card.agent}
            onSaved={charger}
            notify={afficherToast}
          />

          <Card>
            <CardTitle
              title="Actions"
              subtitle="Modifiez l’état de la carte ou prolongez sa validité."
            />
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => appliquer("activer")}
                disabled={card.statut === "actif"}
                className={btnSoft}
              >
                <Power className="size-4" /> Activer
              </button>
              <button
                onClick={() => appliquer("desactiver")}
                disabled={card.statut === "desactive"}
                className={btnMuted}
              >
                <PowerOff className="size-4" /> Désactiver
              </button>
              <button
                onClick={() => {
                  if (confirm("Révoquer cette carte ?")) appliquer("revoquer");
                }}
                disabled={card.statut === "revoque"}
                className={btnDanger}
              >
                <Ban className="size-4" /> Révoquer
              </button>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <p className="text-sm font-semibold text-ink">Renouveler</p>
              <p className="mt-0.5 text-xs text-muted">
                Réactive la carte avec une nouvelle date d’expiration et une
                nouvelle date d’émission.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setExpiration(p.valeur)}
                    className={chip(expiration === p.valeur)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  type="date"
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className={`${inputClass} sm:max-w-[220px]`}
                />
                <button
                  onClick={() => appliquer("renouveler")}
                  className={btnPrimary}
                >
                  <RefreshCw className="size-4" /> Renouveler
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardTitle
              title="QR code"
              subtitle="Scannez pour vérifier l’identité"
            />
            <div className="mx-auto w-full max-w-[220px] rounded-2xl bg-white p-3 ring-1 ring-line">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="QR code de la carte" className="w-full" />
              ) : (
                <Skeleton className="aspect-square w-full" />
              )}
            </div>
            <div className="mt-4 grid gap-2">
              <Link
                href={`/carte/${card.token}`}
                target="_blank"
                className={btnPrimary}
              >
                <Printer className="size-4" /> Imprimer
              </Link>
              <Link
                href={`/v/${card.token}`}
                target="_blank"
                className={btnSoft}
              >
                <ExternalLink className="size-4" /> Page publique
              </Link>
            </div>
          </Card>

          <Card>
            <CardTitle title="Derniers scans" />
            {card.logs.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                Aucun scan enregistré.
              </p>
            ) : (
              <ul className="divide-y divide-line/70">
                {card.logs.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className={`grid size-8 place-items-center rounded-full ${
                        l.resultat === "valide"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {l.resultat === "valide" ? (
                        <ShieldCheck className="size-4" />
                      ) : (
                        <ShieldX className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">
                        {formatDate(l.scannedAt)}
                      </p>
                      <p className="text-xs text-muted">
                        {formatTime(l.scannedAt)}
                      </p>
                    </div>
                    <Pill tone={l.resultat === "valide" ? "green" : "rose"}>
                      {l.resultat === "valide" ? "Valide" : "Invalide"}
                    </Pill>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}