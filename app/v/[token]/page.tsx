import { prisma } from "@/lib/db";

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

  const estExpiree = card?.expireAt && card.expireAt < new Date();
  const estValide = card && card.statut === "actif" && !estExpiree;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
        {estValide ? (
          <>
            <div className="bg-green-600 text-white text-center py-4">
              <p className="text-lg font-bold">✓ Carte valide</p>
            </div>
            <div className="p-6 text-center">
              {card.agent.photoUrl ? (
                <img
                  src={card.agent.photoUrl}
                  alt="Photo agent"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-green-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                  {card.agent.prenom[0]}
                  {card.agent.nom[0]}
                </div>
              )}
              <h1 className="text-xl font-bold">
                {card.agent.prenom} {card.agent.nom}
              </h1>
              <p className="text-gray-500 mt-1">{card.agent.matricule}</p>
              <p className="text-gray-700 mt-3 bg-gray-100 rounded px-3 py-2 inline-block">
                {card.agent.agence}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-red-600 text-white text-center py-4">
              <p className="text-lg font-bold">✗ Carte invalide</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-700">
                {!card
                  ? "Cette carte n'existe pas"
                  : card.statut === "revoque"
                  ? "Cette carte a été révoquée"
                  : "Cette carte a expiré"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}