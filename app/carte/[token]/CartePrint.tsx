"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Info, Printer, ShieldCheck } from "lucide-react";
import { Pill, btnPrimary, chip, cn } from "@/components/admin/ui";

type Props = {
  cardId: string;
  prenom: string;
  nom: string;
  matricule: string;
  sexe: string;
  fonction: string;
  entreprise: string;
  emission: string;
  expiration: string;
  photoUrl: string | null;
  qr: string;
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
const tNom = (s: string) =>
  s.length <= 12 ? 10 : s.length <= 16 ? 8.5 : s.length <= 20 ? 7.5 : 6.5;
const tPre = (s: string) => (s.length <= 16 ? 8 : s.length <= 22 ? 7 : 6.2);
const tTxt = (s: string) => (s.length <= 30 ? 7 : s.length <= 38 ? 6.2 : 5.6);

function Champ({
  label,
  valeur,
  taille,
  style,
  majuscules,
}: {
  label: string;
  valeur: string;
  taille: number;
  style?: React.CSSProperties;
  majuscules?: boolean;
}) {
  return (
    <div style={{ minWidth: 0, ...style }}>
      <div
        style={{
          fontSize: "4pt",
          letterSpacing: "0.12em",
          color: "#7a857e",
          fontWeight: 600,
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: "0.5mm",
          fontSize: `${taille}pt`,
          fontWeight: 700,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textTransform: majuscules ? "uppercase" : undefined,
        }}
      >
        {valeur}
      </div>
    </div>
  );
}

/** Drapeau, République du Mali, emblème et bannière avec le nom de l'application */
function Entete({
  logoOk,
  onLogoError,
}: {
  logoOk: boolean;
  onLogoError: () => void;
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: "4mm",
          top: "2.4mm",
          width: "9mm",
          height: "6mm",
          display: "flex",
          borderRadius: "0.7mm",
          overflow: "hidden",
        }}
      >
        <span style={{ flex: 1, background: "#14b53a" }} />
        <span style={{ flex: 1, background: "#fcd116" }} />
        <span style={{ flex: 1, background: "#ce1126" }} />
      </div>

      <div
        style={{
          position: "absolute",
          left: "15mm",
          right: "16.5mm",
          top: "2.3mm",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "7pt",
            fontWeight: 800,
            letterSpacing: "0.07em",
            lineHeight: 1.1,
          }}
        >
          RÉPUBLIQUE DU MALI
        </div>
        <div
          style={{
            marginTop: "0.5mm",
            fontSize: "4.2pt",
            letterSpacing: "0.14em",
            color: "#7a857e",
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          UN PEUPLE – UN BUT – UNE FOI
        </div>
      </div>

      {logoOk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo-mali.png"
          alt=""
          onError={onLogoError}
          ref={(el) => {
            if (el && el.complete && el.naturalWidth === 0) onLogoError();
          }}
          style={{
            position: "absolute",
            right: "4mm",
            top: "1.6mm",
            width: "9mm",
            height: "9mm",
            objectFit: "contain",
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "11.4mm",
          height: "5.6mm",
          background: `linear-gradient(90deg, ${VERT_FONCE}, ${VERT})`,
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 85.6 5.6"
          preserveAspectRatio="none"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <line x1="58" y1="7" x2="64" y2="-2" stroke={VERT_CLAIR} strokeWidth="2.4" />
          <line x1="66" y1="7" x2="72" y2="-2" stroke={VERT_CLAIR} strokeWidth="0.8" />
        </svg>
        <div
          style={{
            position: "absolute",
            left: "4mm",
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            gap: "1.4mm",
            color: "#fff",
          }}
        >
          <div
            style={{
              width: "3.4mm",
              height: "3.4mm",
              borderRadius: "0.9mm",
              background: "#fff",
              display: "grid",
              placeItems: "center",
            }}
          >
            <ShieldCheck
              style={{ width: "2.3mm", height: "2.3mm", color: VERT_FONCE }}
              strokeWidth={2.4}
            />
          </div>
          <span
            style={{ fontSize: "6.6pt", fontWeight: 800, letterSpacing: "-0.01em" }}
          >
            SecuriApp
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            right: "4mm",
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            fontSize: "4.5pt",
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: "#fff",
          }}
        >
          CARTE PROFESSIONNELLE
        </div>
      </div>
    </>
  );
}

function BarreBas() {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "1.6mm",
        background: `linear-gradient(90deg, ${VERT_FONCE}, ${VERT_CLAIR})`,
      }}
    />
  );
}

export default function CartePrint(p: Props) {
  const [mode, setMode] = useState<Mode>("tous");
  const [logoOk, setLogoOk] = useState(true);

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
            <Entete logoOk={logoOk} onLogoError={() => setLogoOk(false)} />

            {/* Photo */}
            <div
              style={{
                position: "absolute",
                left: "4mm",
                top: "19.6mm",
                width: "22mm",
                height: "26.5mm",
                borderRadius: "1.6mm",
                overflow: "hidden",
                border: `0.45mm solid ${VERT}`,
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

            {/* Matricule */}
            <div
              style={{
                position: "absolute",
                left: "4mm",
                top: "47.3mm",
                width: "22mm",
                height: "4.2mm",
                borderRadius: "999px",
                background: "#eef7f1",
                color: VERT_FONCE,
                fontSize: "7pt",
                fontWeight: 800,
                display: "grid",
                placeItems: "center",
                lineHeight: 1,
              }}
            >
              {p.matricule}
            </div>

            {/* Champs */}
            <div
              style={{
                position: "absolute",
                left: "29.5mm",
                top: "19.4mm",
                width: "52.5mm",
                display: "flex",
                flexDirection: "column",
                gap: "1.3mm",
              }}
            >
              <Champ label="Nom" valeur={p.nom} taille={tNom(p.nom)} majuscules />
              <div style={{ display: "flex", gap: "2mm" }}>
                <Champ
                  label="Prénom"
                  valeur={p.prenom}
                  taille={tPre(p.prenom)}
                  style={{ flex: 1 }}
                />
                <Champ
                  label="Sexe"
                  valeur={p.sexe}
                  taille={7}
                  style={{ width: "12mm", flex: "none" }}
                />
              </div>
              <Champ label="Fonction" valeur={p.fonction} taille={tTxt(p.fonction)} />
              <Champ
                label="Entreprise"
                valeur={p.entreprise}
                taille={tTxt(p.entreprise)}
              />
              <div style={{ display: "flex", gap: "2mm" }}>
                <Champ
                  label="Émission"
                  valeur={p.emission}
                  taille={7}
                  style={{ flex: 1 }}
                />
                <Champ
                  label="Expiration"
                  valeur={p.expiration}
                  taille={7}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <BarreBas />
          </div>

          {/* ───────────── VERSO ───────────── */}
          <div className={cn(face, mode === "recto" && "print:hidden")}>
            <Entete logoOk={logoOk} onLogoError={() => setLogoOk(false)} />

            <div
              style={{
                position: "absolute",
                left: "5mm",
                top: "20mm",
                width: "30mm",
                height: "30mm",
                background: "#fff",
                borderRadius: "2mm",
                padding: "1.1mm",
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
                left: "40mm",
                top: "20.6mm",
                width: "41.5mm",
              }}
            >
              <div
                style={{
                  fontSize: "4.2pt",
                  letterSpacing: "0.2em",
                  fontWeight: 700,
                  color: VERT,
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                Vérification
              </div>
              <div
                style={{
                  marginTop: "1.1mm",
                  fontSize: "9pt",
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                Scannez pour vérifier
              </div>
              <div
                style={{
                  marginTop: "1.4mm",
                  fontSize: "5.4pt",
                  lineHeight: 1.4,
                  color: "#4a564f",
                }}
              >
                Avec l’appareil photo de votre téléphone, confirmez l’identité
                de l’agent.
              </div>
              <div
                style={{
                  marginTop: "1.4mm",
                  fontSize: "5pt",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: "#b42318",
                }}
              >
                Carte « invalide » = ne pas l’accepter.
              </div>
              <div
                style={{
                  marginTop: "2.6mm",
                  borderTop: "0.2mm solid #e5e8e3",
                  paddingTop: "1.3mm",
                }}
              >
                <Champ
                  label="Délivrée par"
                  valeur={p.entreprise}
                  taille={6.6}
                />
              </div>
            </div>

            <BarreBas />
          </div>
        </div>
      </div>
    </div>
  );
}