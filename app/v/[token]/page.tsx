import { headers } from "next/headers";
import { BadgeCheck, MapPin, ShieldCheck, ShieldX, UserRound } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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

  const expiree = !!card?.expireAt && card.expireAt < new Date();
  const valide =
    !!card && card.statut === "actif" && !expiree && card.agent.actif;

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

  const motif = !card
    ? "Cette carte n’existe pas."
    : card.statut === "revoque"
    ? "Cette carte a été révoquée."
    : !card.agent.actif
    ? "Cet agent n’est plus en service."
    : card.statut === "desactive"
    ? "Cette carte est désactivée."
    : "Cette carte a expiré.";

  const maintenant = new Date().toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Bamako",
  });

  return (
    <div className="flex min-h-dvh flex-col items-center bg-[#eceee9] px-4 py-8">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-[#11512f] text-white">
          <ShieldCheck className="size-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-[#101a14]">
          SecuriApp
        </span>
      </div>

      <div className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_40px_rgba(16,26,20,0.08)] ring-1 ring-black/[0.04]">
        {valide && card ? (
          <>
            <div className="relative overflow-hidden bg-linear-to-br from-[#1f8359] to-[#0b3822] px-6 pb-14 pt-8 text-center text-white">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-radial-gradient(circle at 100% 0%, rgba(255,255,255,0.07) 0 1px, transparent 1px 14px)",
                }}
              />
              <span className="relative mx-auto grid size-12 place-items-center rounded-full bg-white/15">
                <BadgeCheck className="size-7" />
              </span>
              <p className="relative mt-3 text-xl font-semibold">Carte valide</p>
              <p className="relative text-sm text-white/70">Identité vérifiée</p>
            </div>

            <div className="-mt-10 px-6 pb-6 text-center">
              {card.agent.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.agent.photoUrl}
                  alt={`${card.agent.prenom} ${card.agent.nom}`}
                  className="mx-auto size-28 rounded-full object-cover ring-4 ring-white"
                />
              ) : (
                <div className="mx-auto grid size-28 place-items-center rounded-full bg-[#d8eee1] text-3xl font-semibold text-[#11512f] ring-4 ring-white">
                  {card.agent.prenom[0]}
                  {card.agent.nom[0]}
                </div>
              )}
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#101a14]">
                {card.agent.prenom} {card.agent.nom}
              </h1>
              <p className="mt-1 inline-block rounded-full bg-[#eef7f1] px-3 py-1 text-xs font-semibold text-[#11512f]">
                {card.agent.matricule}
              </p>

              <div className="mt-5 space-y-2.5 rounded-2xl bg-[#eceee9]/60 p-4 text-left text-sm">
                <div className="flex items-center gap-3">
                  <UserRound className="size-4 text-[#7a857e]" />
                  <span className="text-[#7a857e]">Statut</span>
                  <span className="ml-auto font-medium text-emerald-700">
                    Agent en service
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-[#7a857e]" />
                  <span className="text-[#7a857e]">Agence</span>
                  <span className="ml-auto font-medium text-[#101a14]">
                    {card.agent.agence}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="px-6 pb-8 pt-10 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-rose-50 text-rose-600">
              <ShieldX className="size-8" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#101a14]">
              Carte invalide
            </h1>
            <p className="mt-2 text-sm text-[#7a857e]">{motif}</p>
            <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-xs leading-relaxed text-rose-700">
              Ne faites pas confiance à cette carte. En cas de doute, contactez
              l’organisation.
            </p>
          </div>
        )}

        <div className="border-t border-[#e5e8e3] px-6 py-3 text-center text-[11px] text-[#7a857e]">
          Vérifié le {maintenant}
        </div>
      </div>
    </div>
  );
}