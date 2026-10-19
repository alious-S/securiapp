/**
 * CADRE DE L'ADMINISTRATION (chargé côté serveur)
 * Le nom, le logo et le nombre d'alertes arrivent déjà prêts : le menu
 * s'affiche tout de suite, sans attendre.
 */
import { getSession } from "@/lib/session";
import { chargerModele, compterAlertes } from "@/lib/donnees";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, modele, alertes] = await Promise.all([
    getSession(),
    chargerModele(),
    compterAlertes(),
  ]);

  return (
    <AdminShell
      nom={session?.nom ?? "Administrateur"}
      email={session?.email ?? ""}
      entreprise={modele.nomOrganisation}
      logoSrc={modele.logoSrc}
      alertes={alertes}
    >
      {children}
    </AdminShell>
  );
}