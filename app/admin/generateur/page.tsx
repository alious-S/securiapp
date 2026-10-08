"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Camera,
  Check,
  ImagePlus,
  Info,
  Printer,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  Avatar,
  Card,
  CardTitle,
  PageHeader,
  btnMuted,
  btnPrimary,
  btnSoft,
  chip,
  inputClass,
} from "@/components/admin/ui";

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(
    /\/$/,
    ""
  );

/** Recadre en carré et compresse la photo (évite les envois trop lourds). */
async function compresserImage(file: File, taille = 480): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const cote = Math.min(img.width, img.height);
    const sx = (img.width - cote) / 2;
    const sy = (img.height - cote) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = taille;
    canvas.height = taille;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, sx, sy, cote, cote, 0, 0, taille, taille);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

type Resultat = {
  matricule: string;
  token: string;
  cardId: string;
  qr: string;
  prenom: string;
  nom: string;
};

function Champ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

const FONCTION_DEFAUT = "Agent de sécurité";

export default function GenerateurPage() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    agence: "",
    fonction: FONCTION_DEFAUT,
  });
  const [sexe, setSexe] = useState<"" | "M" | "F">("");
  const [expiration, setExpiration] = useState("");
  const [expirationDefaut, setExpirationDefaut] = useState("");
  const [duree, setDuree] = useState(365);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Date d'expiration proposée = aujourd'hui + durée des Paramètres
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((s) => {
        const jours = s?.dureeValiditeJours ?? 365;
        const d = new Date();
        d.setDate(d.getDate() + jours);
        const iso = d.toISOString().slice(0, 10);
        setDuree(jours);
        setExpirationDefaut(iso);
        setExpiration(iso);
      });
  }, []);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setPhoto(await compresserImage(file));
      setErreur(null);
    } catch {
      setErreur("Impossible de lire cette image.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sexe) {
      setErreur("Choisissez le sexe de l’agent.");
      return;
    }
    setLoading(true);
    setErreur(null);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sexe,
          expireAt: expiration,
          photoUrl: photo,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erreur lors de la création");
      }
      const agent = await res.json();
      const carte = agent.cards[0];
      const qr = await QRCode.toDataURL(`${siteUrl()}/v/${carte.token}`, {
        width: 320,
        margin: 1,
      });
      setResultat({
        matricule: agent.matricule,
        token: carte.token,
        cardId: carte.id,
        qr,
        prenom: agent.prenom,
        nom: agent.nom,
      });
      setForm({ nom: "", prenom: "", agence: "", fonction: FONCTION_DEFAUT });
      setSexe("");
      setExpiration(expirationDefaut);
      setPhoto(null);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Générateur"
        subtitle="Créez un agent : sa carte et son QR code sont générés automatiquement."
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardTitle
            title="Nouvel agent"
            subtitle="Renseignez les informations de l’agent."
          />
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar
                photoUrl={photo}
                prenom={form.prenom}
                nom={form.nom}
                className="size-24 text-2xl ring-4 ring-brand-50"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={btnSoft}
                >
                  <ImagePlus className="size-4" /> Importer
                </button>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className={btnSoft}
                >
                  <Camera className="size-4" /> Prendre une photo
                </button>
                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className={btnMuted}
                  >
                    <Trash2 className="size-4" /> Retirer
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPhoto}
                className="hidden"
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={onPhoto}
                className="hidden"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Champ label="Prénom">
                <input
                  required
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  className={inputClass}
                  placeholder="Ibrahim"
                />
              </Champ>
              <Champ label="Nom">
                <input
                  required
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className={inputClass}
                  placeholder="Diarra"
                />
              </Champ>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted">
                Sexe
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSexe("M")}
                  className={chip(sexe === "M")}
                >
                  Homme
                </button>
                <button
                  type="button"
                  onClick={() => setSexe("F")}
                  className={chip(sexe === "F")}
                >
                  Femme
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Champ label="Fonction">
                <input
                  required
                  value={form.fonction}
                  onChange={(e) =>
                    setForm({ ...form, fonction: e.target.value })
                  }
                  className={inputClass}
                  placeholder={FONCTION_DEFAUT}
                />
              </Champ>
              <Champ label="Agence">
                <input
                  required
                  value={form.agence}
                  onChange={(e) => setForm({ ...form, agence: e.target.value })}
                  className={inputClass}
                  placeholder="Bamako Centre"
                />
              </Champ>
            </div>

            <Champ label="Date d’expiration de la carte">
              <input
                type="date"
                required
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                className={`${inputClass} sm:max-w-[220px]`}
              />
              <span className="mt-1.5 block text-xs text-muted">
                Proposée : {duree} jours (réglable dans Paramètres).
              </span>
            </Champ>

            <div className="flex items-start gap-2.5 rounded-2xl bg-brand-50 px-4 py-3 text-xs text-brand-800">
              <Info className="mt-0.5 size-4 shrink-0" />
              Le matricule (AG-XX) et la date d’émission sont attribués
              automatiquement à la création.
            </div>

            {erreur && (
              <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                {erreur}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} w-full`}
            >
              {loading ? "Création…" : "Créer l’agent et sa carte"}
            </button>
          </form>
        </Card>

        <div className="lg:col-span-2">
          {resultat ? (
            <Card className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-100 text-brand-700">
                <Check className="size-6" />
              </span>
              <p className="mt-3 text-lg font-semibold text-ink">Carte créée</p>
              <p className="text-sm text-muted">
                {resultat.prenom} {resultat.nom}
              </p>
              <p className="mt-3 inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-800">
                {resultat.matricule}
              </p>
              <div className="mx-auto mt-4 w-full max-w-[200px] rounded-2xl bg-white p-3 ring-1 ring-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultat.qr} alt="QR code" className="w-full" />
              </div>
              <div className="mt-5 grid gap-2">
                <Link
                  href={`/carte/${resultat.token}`}
                  target="_blank"
                  className={btnPrimary}
                >
                  <Printer className="size-4" /> Imprimer la carte
                </Link>
                <Link
                  href={`/admin/cartes/${resultat.cardId}`}
                  className={btnSoft}
                >
                  Voir la fiche
                </Link>
                <button onClick={() => setResultat(null)} className={btnMuted}>
                  <RotateCcw className="size-4" /> Créer un autre agent
                </button>
              </div>
            </Card>
          ) : (
            <Card>
              <CardTitle title="Aperçu" subtitle="Mis à jour pendant la saisie" />
              <div className="flex flex-col items-center rounded-2xl bg-canvas/60 px-4 py-8 text-center">
                <Avatar
                  photoUrl={photo}
                  prenom={form.prenom}
                  nom={form.nom}
                  className="size-24 text-2xl ring-4 ring-white"
                />
                <p className="mt-4 text-lg font-semibold text-ink">
                  {form.prenom || form.nom ? (
                    `${form.prenom} ${form.nom}`
                  ) : (
                    <span className="text-muted">Prénom Nom</span>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {form.fonction || FONCTION_DEFAUT}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {sexe === "M" ? "Homme" : sexe === "F" ? "Femme" : "Sexe"} ·{" "}
                  {form.agence || "Agence"}
                </p>
                <span className="mt-4 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-muted ring-1 ring-line">
                  Matricule attribué à la création
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}