"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  Info,
  MapPin,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Pill, btnPrimary, chip, cn } from "@/components/admin/ui";

type Props = {
  cardId: string;
  prenom: string;
  nom: string;
  matricule: string;
  agence: string;
  photoUrl: string | null;
  organisation: string;
  validite: string;
  qr: string;
  lien: string;
  etatLabel: string;
  etatTone: "green" | "amber" | "rose" | "slate";
};

type Mode = "tous" | "recto" | "verso";

const modes: { value: Mode; label: string }[] = [
  { value: "tous", label: "Recto + verso" },
  { value: "recto", label: "Recto seul" },
  { value: "verso", label: "Verso seul" },
];

const VERT_FONCE = "#11512f";
const VERT = "#1f8359";
const VERT_CLAIR = "#55b98a";

// Le texte rétrécit selon la longueur pour ne jamais être coupé
const tailleNom = (n: string) =>
  n.length <= 9 ? 13 : n.length <= 12 ? 11 : n.length <= 15 ? 9.5 : n.length <= 19 ? 8 : 7;
const taillePrenom = (p: string) =>
  p.length <= 14 ? 9 : p.length <= 20 ? 7.5 : 6.5;

function Bandes({ face }: { face: "recto" | "verso" }) {
  return (
    <svg
      viewBox="0 0 85.6 53.98"
      preserveAspectRatio="none"
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      {face === "recto" ? (
        <>
          <line x1="39" y1="-3" x2="5" y2="57" stroke={VERT_FONCE} strokeWidth="5.2" />
          <line x1="47" y1="-3" x2="13" y2="57" stroke={VERT_CLAIR} strokeWidth="1.1" />
          <line x1="42" y1="-4" x2="92" y2="13.5" stroke={VERT_CLAIR} strokeWidth="3.6" />
          <line x1="52" y1="-5" x2="94" y2="9" stroke={VERT} strokeWidth="1.2" />
        </>
      ) : (
        <>
          <line x1="56" y1="-4" x2="98" y2="13" stroke={VERT_CLAIR} strokeWidth="3.6" />
          <line x1="66" y1="-5" x2="100" y2="9" stroke={VERT} strokeWidth="1.2" />
          <line x1="-4" y1="43" x2="18" y2="57" stroke={VERT_FONCE} strokeWidth="5.2" />
          <line x1="-4" y1="49" x2="10" y2="58" stroke={VERT_CLAIR} strokeWidth="1.1" />
        </>
      )}
    </svg>
  );
}

export default function CartePrint(p: Props) {
  const [mode, setMode] = useState<Mode>("tous");
  const host = (() => {
    try {
      return new URL(p.lien).host;
    } catch {
      return "";
    }
  })();

  const face =
    "carte-face relative h-[53.98mm] w-[85.6mm] shrink-0 overflow-hidden rounded-[3.2mm] bg-white text-[#101a14] shadow-lg ring-1 ring-black/10 print:h-[53.9mm] print:rounded-none print:shadow-none print:ring-0";

  return (
    <div className="carte-print-root min-h-dvh bg-canvas px-4 py-6 print:block print:min-h-0 print:bg-white print:p-0">
      {/* Barre d'outils (non imprimée) */}
      <div className="mx-auto mb-8 max-w-3xl space-y-4 print:hidden">
        <Link
          href={`/admin/cartes/${p.cardId}`}
          className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-ink"
        >
          <ChevronLeft className="size-4" /> Fiche de la carte
        </Link>

        <div className="rounded-3xl bg-white p-5 ring-1 ring-black/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-ink">
                {p.prenom} {p.nom}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-muted">{p.matricule}</span>
                <Pill tone={p.etatTone}>{p.etatLabel}</Pill>
              </div>
            </div>
            <button onClick={() => window.print()} className={btnPrimary}>
              <Printer className="size-4" /> Imprimer
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {modes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={chip(mode === m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              Dans la fenêtre d’impression : choisissez votre imprimante à
              cartes, format <strong>CR80 (85,6 × 54 mm)</strong>, échelle{" "}
              <strong>100 %</strong>, marges <strong>aucune</strong>, et cochez{" "}
              <strong>Graphiques d’arrière-plan</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Cartes */}
      <div className="carte-zoom mx-auto w-fit print:mx-0">
        <div className="flex flex-col gap-4 print:block">
          {/* ───────────── RECTO ───────────── */}
          <div
            className={cn(
              face,
              mode === "tous" && "carte-break",
              mode === "verso" && "print:hidden"
            )}
          >
            <Bandes face="recto" />

            {/* Anneau blanc puis photo */}
            <div
              style={{
                position: "absolute",
                left: "7.3mm",
                top: "13.3mm",
                width: "28.4mm",
                height: "28.4mm",
                borderRadius: "50%",
                background: "#fff",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "9.5mm",
                top: "15.5mm",
                width: "24mm",
                height: "24mm",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#d8eee1",
              }}
            >
              {p.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photoUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: "100%",
                    height: "100%",
                    fontSize: "18pt",
                    fontWeight: 700,
                    color: VERT_FONCE,
                  }}
                >
                  {p.prenom[0]}
                  {p.nom[0]}
                </div>
              )}
            </div>

            {/* Identité */}
            <div
              style={{
                position: "absolute",
                left: "38.5mm",
                top: "15.2mm",
                width: "43mm",
              }}
            >
              <div
                style={{
                  fontSize: "4.6pt",
                  letterSpacing: "0.22em",
                  fontWeight: 600,
                  color: VERT,
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                Agent de sécurité
              </div>
              <div
                style={{
                  marginTop: "1.3mm",
                  fontSize: `${tailleNom(p.nom)}pt`,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.nom}
              </div>
              <div
                style={{
                  marginTop: "0.5mm",
                  fontSize: `${taillePrenom(p.prenom)}pt`,
                  fontWeight: 500,
                  lineHeight: 1.2,
                  color: "#2c3a32",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.prenom}
              </div>
              <div
                style={{
                  marginTop: "2mm",
                  display: "inline-block",
                  background: "#eef7f1",
                  color: VERT_FONCE,
                  fontSize: "7pt",
                  fontWeight: 700,
                  padding: "0.5mm 2.2mm",
                  borderRadius: "999px",
                  lineHeight: 1.3,
                }}
              >
                {p.matricule}
              </div>
            </div>

            {/* Agence + validité */}
            <div
              style={{
                position: "absolute",
                left: "38.5mm",
                top: "35.3mm",
                width: "43mm",
                fontSize: "6.2pt",
                lineHeight: 1.2,
                color: "#2c3a32",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1.4mm" }}>
                <MapPin
                  style={{ width: "2.6mm", height: "2.6mm", flex: "none", color: VERT }}
                  strokeWidth={2}
                />
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.agence}
                </span>
              </div>
              <div
                style={{
                  marginTop: "1.2mm",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.4mm",
                }}
              >
                <Calendar
                  style={{ width: "2.6mm", height: "2.6mm", flex: "none", color: VERT }}
                  strokeWidth={2}
                />
                <span style={{ whiteSpace: "nowrap" }}>{p.validite}</span>
              </div>
            </div>

            {/* Pied : logo */}
            <div
              style={{
                position: "absolute",
                left: "38.5mm",
                right: "4mm",
                bottom: "3.2mm",
                display: "flex",
                alignItems: "center",
                gap: "1.6mm",
                borderTop: "0.2mm solid #e5e8e3",
                paddingTop: "1.6mm",
              }}
            >
              <div
                style={{
                  width: "4.4mm",
                  height: "4.4mm",
                  borderRadius: "1.2mm",
                  background: VERT_FONCE,
                  display: "grid",
                  placeItems: "center",
                  flex: "none",
                }}
              >
                <ShieldCheck
                  style={{ width: "2.7mm", height: "2.7mm", color: "#fff" }}
                  strokeWidth={2.2}
                />
              </div>
              <span
                style={{
                  fontSize: "6.5pt",
                  fontWeight: 700,
                  color: VERT_FONCE,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.organisation}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "4.4pt",
                  color: "#7a857e",
                  whiteSpace: "nowrap",
                }}
              >
                QR code au verso
              </span>
            </div>
          </div>

          {/* ───────────── VERSO ───────────── */}
          <div className={cn(face, mode === "recto" && "print:hidden")}>
            <Bandes face="verso" />

            <div
              style={{
                position: "absolute",
                left: "6mm",
                top: "8mm",
                width: "33mm",
                height: "33mm",
                background: "#fff",
                borderRadius: "2.2mm",
                padding: "1.2mm",
                boxShadow:
                  "0 0 0 0.25mm #d8eee1, 0 0.6mm 1.6mm rgba(17,81,47,0.18)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.qr}
                alt="QR code"
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                left: "44mm",
                top: "16mm",
                width: "37.5mm",
              }}
            >
              <div
                style={{
                  fontSize: "4.6pt",
                  letterSpacing: "0.22em",
                  fontWeight: 600,
                  color: VERT,
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                Vérification
              </div>
              <div
                style={{
                  marginTop: "1.3mm",
                  fontSize: "9.5pt",
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                Scannez pour vérifier
              </div>
              <div
                style={{
                  marginTop: "1.6mm",
                  fontSize: "5.6pt",
                  lineHeight: 1.4,
                  color: "#4a564f",
                }}
              >
                Avec l’appareil photo de votre téléphone, confirmez l’identité
                de l’agent.
              </div>
              <div
                style={{
                  marginTop: "1.8mm",
                  fontSize: "5.2pt",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: "#b42318",
                }}
              >
                Carte « invalide » = ne pas l’accepter.
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                left: "19mm",
                right: "6mm",
                bottom: "3.2mm",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "2mm",
                fontSize: "4.6pt",
                color: "#7a857e",
                borderTop: "0.2mm solid #e5e8e3",
                paddingTop: "1.4mm",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: VERT_FONCE,
                  fontSize: "5.6pt",
                  whiteSpace: "nowrap",
                }}
              >
                {p.organisation}
              </span>
              <span style={{ whiteSpace: "nowrap" }}>{host}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}