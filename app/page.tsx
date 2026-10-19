import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function Entree() {
  const session = await getSession();
  redirect(session ? "/admin" : "/login");
}