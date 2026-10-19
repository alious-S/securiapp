/** MES AGENTS : la seule liste du site (un agent = une carte). Chargée côté serveur. */
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Card, EmptyState, PageHeader, btnPrimary } from "@/components/admin/ui";
import ListeAgents from "@/components/admin/ListeAgents";
import { listerAgents } from "@/lib/donnees";
import { etatAgent } from "@/lib/etat-agent";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await listerAgents();
  const aRenouveler = agents.filter((a) => etatAgent(a.actif, a.cards[0]).aSurveiller).length;

  return (
    <>
      <PageHeader
        title="Mes agents"
        subtitle={
          agents.length === 0
            ? "Aucun agent pour l’instant."
            : `${agents.length} ${agents.length > 1 ? "agents" : "agent"}${aRenouveler > 0 ? ` · ${aRenouveler} à renouveler` : ""}`
        }
        actions={
          <Link href="/admin/generateur" className={btnPrimary}>
            <Plus className="size-4" /> Nouvel agent
          </Link>
        }
      />

      {agents.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="size-6" />}
            title="Ajoutez votre premier agent"
            text="Sa carte avec son QR code sera prête à imprimer en quelques secondes."
          />
          <div className="flex justify-center pb-6">
            <Link href="/admin/generateur" className={btnPrimary}>
              <Plus className="size-4" /> Ajouter un agent
            </Link>
          </div>
        </Card>
      ) : (
        <ListeAgents agentsInitiaux={agents} />
      )}
    </>
  );
}