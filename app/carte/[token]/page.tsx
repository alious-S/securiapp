"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Agent = {
  nom: string;
  prenom: string;
  matricule: string;
  agence: string;
  photoUrl: string | null;
};

export default function CartePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { token } = await params;
      const res = await fetch(`/api/verify/${token}`);
      const data = await res.json();

      if (!data.valide) {
        setNotFound(true);
        return;
      }

      setAgent(data.agent);
      const verifyUrl = `${window.location.origin}/v/${token}`;
      const qr = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 });
      setQrDataUrl(qr);
    }
    load();
  }, [params]);

  if (notFound) {
    return <p className="p-8 text-center">Carte introuvable.</p>;
  }

  if (!agent || !qrDataUrl) {
    return <p className="p-8 text-center">Chargement...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
      <button
        onClick={() => window.print()}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded print:hidden"
      >
        🖨️ Imprimer la carte
      </button>

      <div
        className="bg-white rounded-xl shadow-lg border overflow-hidden"
        style={{ width: "340px", height: "214px" }}
      >
        <div className="bg-blue-700 text-white text-center py-1.5">
          <p className="text-xs font-bold tracking-wide">
            CARTE AGENT DE SÉCURITÉ
          </p>
        </div>

        <div className="flex p-3 gap-3 items-center">
          {agent.photoUrl ? (
            <img
              src={agent.photoUrl}
              alt="Photo"
              className="w-16 h-16 rounded object-cover border"
            />
          ) : (
            <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 border">
              {agent.prenom[0]}
              {agent.nom[0]}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight">
              {agent.prenom} {agent.nom}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Matricule : {agent.matricule}
            </p>
            <p className="text-xs text-gray-600">{agent.agence}</p>
          </div>

          <img src={qrDataUrl} alt="QR code" className="w-16 h-16" />
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: 85.6mm 53.98mm;
            margin: 0;
          }
          body {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}