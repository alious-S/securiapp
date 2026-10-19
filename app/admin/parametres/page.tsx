/** RÉGLAGES : validité des cartes et compte. (Le nom et le logo sont dans « Ma carte ».) */
import Link from "next/link";
import { ChevronRight, IdCard } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";
import { FormMotDePasse, FormValidite } from "@/components/admin/FormReglages";
import { chargerModele } from "@/lib/donnees";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ReglagesPage() {
  const [modele, session] = await Promise.all([chargerModele(), getSession()]);

  return (
    <>
      <PageHeader title="Réglages" subtitle="Les quelques réglages qui comptent." />

      <div className="space-y-4">
        <Link href="/admin/modele-carte" className="group block">
          <Card className="flex items-center gap-4 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-[0_6px_14px_rgba(31,131,89,0.28)]">
              <IdCard className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-ink">Nom, logo et apparence des cartes</p>
              <p className="text-xs text-muted">Entreprise actuelle : {modele.nomOrganisation}</p>
            </div>
            <ChevronRight className="size-5 text-muted transition group-hover:translate-x-0.5" />
          </Card>
        </Link>

        <FormValidite joursInitial={modele.dureeValiditeJours} />
        <FormMotDePasse nom={session?.nom ?? ""} email={session?.email ?? ""} />
      </div>
    </>
  );
}
