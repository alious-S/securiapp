import { headers } from "next/headers";
import {
  Building2,
  Calendar,
  CalendarClock,
  Check,
  ShieldCheck,
  ShieldX,
  UserX,
  X,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDateFR } from "@/lib/dates";

export const dynamic = "force-dynamic";

type Etat =
  | "valide"
  | "hors_service"
  | "revoquee"
  | "desactivee"
  | "expiree"
  | "inconnue";

function Ligne({
  icone,
  label,
  valeur,
  accent,
}: {
  icone: React.ReactNode;
  label: string;
  valeur: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3 text-sm">
      <span className="shrink-0 text-[#1f8359]">{icone}</span>
      <span className="shrink-0 text-[#7a857e]">{label}</span>
      <span
        className={`ml-auto min-w-0 break-words text-right font-semibold ${
          accent ? "text-emerald-700" : "text-[#101a14]"
        }`}
      >
        {valeur}
      </span>
    </div>
  );
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const card = await prisma.card.findUnique({
    where: { token },
    include: { agent: true },
  });
  const settings = await prisma.settings.findUnique({ where: { id: "main" } });
  const entreprise = settings?.nomOrganisation ?? "SecuriApp";

  const expiree = !!card?.expireAt && card.expireAt < new Date();

  // Ordre de priorité : une carte révoquée reste "révoquée", puis on regarde
  // si l'agent est sur le terrain, puis l'état de la carte.
  const etat: Etat = !card
    ? "inconnue"
    : card.statut === "revoque"
    ? "revoquee"
    : !card.agent.actif
    ? "hors_service"
    : card.statut === "desactive"
    ? "desactivee"
    : expiree
    ? "expiree"
    : "valide";

  const valide = etat === "valide";

  // Enregistre le scan (sans jamais bloquer l'affichage)
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnu";
    await prisma.verificationLog.create({
      data: {
        resultat: valide ? "valide" : "invalide",
        cardId: card?.id ?? null,
        ipAddress: ip,
      },
    });
  } catch (e) {
    console.error("Log de vérification impossible", e);
  }

  const motif =
    etat === "inconnue"
      ? "Cette carte n’existe pas."
      : etat === "revoquee"
      ? "Cette carte a été révoquée."
      : etat === "desactivee"
      ? "Cette carte est désactivée."
      : "Cette carte a expiré.";

  const theme = valide
    ? {
        degrade: "from-[#1f8359] to-[#0b3822]",
        trait: "#55b98a",
        icone: "text-[#11512f]",
        libelle: "Carte valide",
      }
    : etat === "hors_service"
    ? {
        degrade: "from-[#f59e0b] to-[#92400e]",
        trait: "#fcd34d",
        icone: "text-[#b45309]",
        libelle: "Hors service",
      }
    : {
        degrade: "from-[#e11d48] to-[#7f1032]",
        trait: "#fb7185",
        icone: "text-[#be123c]",
        libelle: "Carte invalide",
      };

  const maintenant = new Date().toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Bamako",
  });

  return (
    <div className="flex min-h-dvh flex-col items-center bg-[#eceee9] px-4 pb-8 pt-6">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-[#11512f] text-white">
          <ShieldCheck className="size-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-[#101a14]">
          SecuriApp
        </span>
      </div>

      <div className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_40px_rgba(16,26,20,0.08)] ring-1 ring-black/[0.04]">
        {/* Bannière */}
        <div
          className={`relative h-[152px] overflow-hidden bg-linear-to-br ${theme.degrade}`}
        >
          <svg
            viewBox="0 0 384 152"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
            className="absolute inset-0 size-full"
          >
            <line
              x1="262"
              y1="-10"
              x2="178"
              y2="170"
              stroke={theme.trait}
              strokeWidth="26"
            />
            <line
              x1="312"
              y1="-10"
              x2="238"
              y2="170"
              stroke="#fff"
              strokeOpacity="0.18"
              strokeWidth="8"
            />
            <line
              x1="-10"
              y1="30"
              x2="90"
              y2="170"
              stroke="#fff"
              strokeOpacity="0.1"
              strokeWidth="30"
            />
          </svg>

          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/15 py-1.5 pl-2 pr-3.5 text-[13px] font-semibold text-white backdrop-blur-sm">
            <span
              className={`grid size-[22px] place-items-center rounded-full bg-white ${theme.icone}`}
            >
              {valide ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : (
                <X className="size-3.5" strokeWidth={3} />
              )}
            </span>
            {theme.libelle}
          </div>
        </div>

        {/* Corps : la photo chevauche la bannière (z-10 = au-dessus) */}
        <div className="relative z-10 -mt-16 px-6 pb-6 text-center">
          {valide && card ? (
            <>
              <div className="mx-auto size-32 overflow-hidden rounded-full border-[6px] border-white bg-[#d8eee1] shadow-[0_4px_16px_rgba(16,26,20,0.12)]">
                {card.agent.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.agent.photoUrl}
                    alt={`${card.agent.prenom} ${card.agent.nom}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-4xl font-bold text-[#11512f]">
                    {card.agent.prenom[0]}
                    {card.agent.nom[0]}
                  </div>
                )}
              </div>

              <h1 className="mt-4 text-balance break-words text-2xl font-bold tracking-tight text-[#101a14]">
                {card.agent.prenom} {card.agent.nom}
              </h1>
              <p className="mt-1 text-[13px] text-[#7a857e]">
                {card.agent.fonction}
              </p>
              <span className="mt-3 inline-block rounded-full bg-[#eef7f1] px-3.5 py-1.5 text-[13px] font-bold text-[#11512f]">
                {card.agent.matricule}
              </span>

              <div className="mt-5 divide-y divide-[#e5e8e3] rounded-[20px] bg-[#eceee9]/60 px-4 text-left">
                <Ligne
                  icone={<Building2 className="size-[18px]" />}
                  label="Entreprise"
                  valeur={entreprise}
                />
                <Ligne
                  icone={<Calendar className="size-[18px]" />}
                  label="Émise le"
                  valeur={formatDateFR(card.issuedAt ?? card.createdAt)}
                />
                <Ligne
                  icone={<CalendarClock className="size-[18px]" />}
                  label="Expire le"
                  valeur={
                    card.expireAt
                      ? formatDateFR(card.expireAt)
                      : "Sans expiration"
                  }
                />
                <Ligne
                  icone={<ShieldCheck className="size-[18px]" />}
                  label="Statut"
                  valeur="Agent en service"
                  accent
                />
              </div>
            </>
          ) : etat === "hors_service" ? (
            <>
              <div className="mx-auto grid size-32 place-items-center rounded-full border-[6px] border-white bg-[#fffbeb] text-[#d97706] shadow-[0_4px_16px_rgba(16,26,20,0.12)]">
                <UserX className="size-14" strokeWidth={1.8} />
              </div>
              <h1 className="mt-4 text-balance text-2xl font-bold tracking-tight text-[#101a14]">
                L’agent n’est pas sur le terrain
              </h1>
              <p className="mt-1 text-[13px] text-[#7a857e]">
                Cet agent n’est pas en service actuellement.
              </p>
              <p className="mt-5 rounded-2xl bg-[#fffbeb] px-4 py-3 text-[12.5px] leading-relaxed text-[#b45309]">
                Ne lui accordez pas l’accès en tant qu’agent de sécurité. En cas
                de doute, contactez {entreprise}.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto grid size-32 place-items-center rounded-full border-[6px] border-white bg-[#fff1f2] text-[#e11d48] shadow-[0_4px_16px_rgba(16,26,20,0.12)]">
                <ShieldX className="size-14" strokeWidth={1.8} />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#101a14]">
                Carte invalide
              </h1>
              <p className="mt-1 text-[13px] text-[#7a857e]">{motif}</p>
              <p className="mt-5 rounded-2xl bg-[#fff1f2] px-4 py-3 text-[12.5px] leading-relaxed text-[#be123c]">
                Ne faites pas confiance à cette carte. En cas de doute,
                contactez l’organisation.
              </p>
            </>
          )}
        </div>

        <div className="border-t border-[#e5e8e3] px-6 py-3 text-center text-[11px] text-[#7a857e]">
          Vérifié le {maintenant}
        </div>
      </div>
    </div>
  );
}