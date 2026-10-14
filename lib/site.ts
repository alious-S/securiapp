/**
 * ADRESSE PUBLIQUE DU SITE (utilisée dans les QR codes)
 * Priorité à NEXT_PUBLIC_SITE_URL (réglée dans Vercel) pour que les QR codes
 * pointent toujours vers la bonne adresse, quelle que soit la page d'où on imprime.
 */
import { headers } from "next/headers";

export async function urlDuSite() {
  const fixe = process.env.NEXT_PUBLIC_SITE_URL;
  if (fixe) return fixe.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}