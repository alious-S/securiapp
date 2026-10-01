type VerifyResponse =
  | {
      valide: true;
      agent: {
        nom: string;
        prenom: string;
        matricule: string;
        agence: string;
        photoUrl: string | null;
      };
    }
  | { valide: false; message: string };

async function getVerification(token: string): Promise<VerifyResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/verify/${token}`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await getVerification(token);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
        {result.valide ? (
          <>
            <div className="bg-green-600 text-white text-center py-4">
              <p className="text-lg font-bold">✓ Carte valide</p>
            </div>
            <div className="p-6 text-center">
              {result.agent.photoUrl ? (
                <img
                  src={result.agent.photoUrl}
                  alt="Photo agent"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-green-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                  {result.agent.prenom[0]}
                  {result.agent.nom[0]}
                </div>
              )}
              <h1 className="text-xl font-bold">
                {result.agent.prenom} {result.agent.nom}
              </h1>
              <p className="text-gray-500 mt-1">{result.agent.matricule}</p>
              <p className="text-gray-700 mt-3 bg-gray-100 rounded px-3 py-2 inline-block">
                {result.agent.agence}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-red-600 text-white text-center py-4">
              <p className="text-lg font-bold">✗ Carte invalide</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-700">{result.message}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}