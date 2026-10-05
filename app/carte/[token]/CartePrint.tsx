"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Info, Printer } from "lucide-react";
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
          {/* RECTO */}
          <div
            className={cn(
              face,
              mode === "tous" && "carte-break",
              mode === "verso" && "print:hidden"
            )}
          >
            <div className="flex h-[11mm] items-center justify-between bg-[#11512f] px-[4mm] text-white">
              <span className="max-w-[48mm] truncate text-[7pt] font-semibold uppercase tracking-wide">
                {p.organisation}
              </span>
              <span className="text-[5pt] font-medium uppercase tracking-[0.15em] opacity-80">
                Agent de sécurité
              </span>
            </div>

            <div className="flex gap-[4mm] px-[4mm] pt-[4mm]">
              <div className="h-[28mm] w-[22mm] shrink-0 overflow-hidden rounded-[1.5mm] bg-[#d8eee1]">
                {p.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[16pt] font-bold text-[#11512f]">
                    {p.prenom[0]}
                    {p.nom[0]}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[7pt] text-[#7a857e]">{p.prenom}</p>
                <p className="break-words text-[12pt] font-bold uppercase leading-tight">
                  {p.nom}
                </p>
                <span className="mt-[2mm] inline-block rounded-full bg-[#eef7f1] px-[2mm] py-[0.4mm] text-[8pt] font-bold text-[#11512f]">
                  {p.matricule}
                </span>
                <p className="mt-[2.5mm] text-[5pt] uppercase tracking-wider text-[#7a857e]">
                  Agence
                </p>
                <p className="truncate text-[8pt] font-semibold">{p.agence}</p>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex h-[6mm] items-center justify-between bg-[#eef7f1] px-[4mm] text-[5.5pt] text-[#11512f]">
              <span className="font-medium">{p.validite}</span>
              <span className="opacity-70">QR code au verso</span>
            </div>
          </div>

          {/* VERSO */}
          <div className={cn(face, mode === "recto" && "print:hidden")}>
            <div className="h-[3mm] bg-[#11512f]" />
            <div className="flex h-[44mm] items-center gap-[5mm] px-[5mm]">
              <div className="size-[32mm] shrink-0 rounded-[1.5mm] bg-white p-[1mm] ring-1 ring-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.qr} alt="QR code" className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9pt] font-bold leading-tight">
                  Vérifiez cette carte
                </p>
                <p className="mt-[1.5mm] text-[6pt] leading-snug text-[#4a564f]">
                  Scannez le QR code avec l’appareil photo de votre téléphone
                  pour confirmer l’identité de l’agent.
                </p>
                <p className="mt-[2mm] text-[5.5pt] font-semibold leading-snug text-[#b42318]">
                  Une carte « invalide » ne doit pas être acceptée.
                </p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex h-[6mm] items-center justify-between bg-[#eef7f1] px-[5mm] text-[5pt] text-[#11512f]">
              <span className="font-medium">{p.organisation}</span>
              <span className="opacity-70">{host}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}