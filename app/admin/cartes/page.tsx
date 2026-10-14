import { redirect } from "next/navigation";

// Les cartes et les agents ne forment plus qu'une seule liste : "Mes agents"
export default function Cartes() {
  redirect("/admin/agents");
}