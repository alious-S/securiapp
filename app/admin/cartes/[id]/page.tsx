/**
 * FICHE D'UN AGENT ET DE SA CARTE (chargée côté serveur)
 * L'essentiel : qui est-ce, la carte est-elle valable, imprimer, gérer.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ChevronLeft, Printer, ShieldCheck, ShieldX } from "lucide-react";
import { Avatar, Card, CardTitle, PageHeader, Pill, btnPrimary, cn, formatDate, formatTime } from "@/components/admin/ui";
import ActionsCarte from "@/components/admin/ActionsCarte";
import InfosAgent from "@/components/admin/InfosAgent";
import { chargerCarte, chargerModele } from "@/lib/donnees";
import { etatAgent } from "@/lib/etat-agent";
import { urlDuSite } from "@/lib/site";

export const dynamic = "force-dynamic";

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{children}</p>
    </div>
  );
}

export default async function FichePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [carte, modele] = await Promise.all([chargerCarte(id), chargerModele()]);
  if (!carte) notFound();

  const { agent } = carte;
  const etat = etatAgent(agent.actif, carte);
  const qr = await QRCode.toDataURL(`${await urlDuSite()}/v/${carte.token}`, { width: 320, margin: 1 });
  const expiree = !!carte.expireAt && carte.expireAt < new Date();

  return (
    <>
      <Link href="/admin/agents" className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition hover:text-ink">
        <ChevronLeft className="size-4" /> Mes agents
      </Link>

      <PageHeader
        title={`${agent.prenom} ${agent.nom}`}
        subtitle={`${agent.fonction} · ${agent.matricule}`}
        actions={
          <Link href={`/carte/${carte.token}`} className={btnPrimary}>
            <Printer className="size-4" /> Imprimer la carte
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex items-center gap-4">
              <Avatar prenom={agent.prenom} nom={agent.nom} className="size-20 text-xl" />
              <div className="min-w-0">
                <Pill tone={etat.tone}>{etat.label}</Pill>
                <p className="mt-2 text-sm text-muted">
                  {agent.sexe === "M" ? "Homme" : agent.sexe === "F" ? "Femme" : "Sexe non renseigné"} · {agent.agence}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <Info label="Carte émise le">{formatDate(carte.issuedAt ?? carte.createdAt)}</Info>
              <Info label="Valable jusqu’au">
                <span className={cn(expiree && "text-rose-600")}>
                  {carte.expireAt ? formatDate(carte.expireAt) : "Sans date limite"}
                </span>
              </Info>
            </div>
          </Card>

          <ActionsCarte
            cardId={carte.id}
            agentId={agent.id}
            statut={carte.statut}
            actif={agent.actif}
            dureeDefaut={modele.dureeValiditeJours}
          />

          <InfosAgent agent={agent} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardTitle title="QR code" subtitle="Imprimé sur la carte" />
            <div className="mx-auto w-full max-w-[200px] rounded-2xl bg-white p-3 ring-1 ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code de la carte" className="w-full" />
            </div>
          </Card>

          <Card>
            <CardTitle title="Derniers contrôles" />
            {carte.logs.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">Cette carte n’a pas encore été scannée.</p>
            ) : (
              <ul className="divide-y divide-line/70">
                {carte.logs.map((l) => {
                  const accepte = l.resultat === "valide";
                  return (
                    <li key={l.id} className="flex items-center gap-3 py-2.5">
                      <span
                        className={cn(
                          "grid size-8 place-items-center rounded-full",
                          accepte ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                        )}
                      >
                        {accepte ? <ShieldCheck className="size-4" /> : <ShieldX className="size-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">{formatDate(l.scannedAt)}</p>
                        <p className="text-xs text-muted">{formatTime(l.scannedAt)}</p>
                      </div>
                      <Pill tone={accepte ? "green" : "rose"}>{accepte ? "Acceptée" : "Refusée"}</Pill>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}