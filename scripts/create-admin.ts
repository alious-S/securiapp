import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

async function main() {
  // Charge le fichier .env (Node 20.12+), sans écraser une variable déjà définie
  try {
    process.loadEnvFile();
  } catch {
    /* pas de fichier .env, on continue */
  }

  const [email, motDePasse, ...reste] = process.argv.slice(2);
  const nom = reste.join(" ").trim();

  if (!email || !motDePasse || !nom) {
    console.log(
      'Usage : npx tsx scripts/create-admin.ts <email> <motDePasse> "<Nom complet>"'
    );
    process.exit(1);
  }
  if (motDePasse.length < 8) {
    console.log("Le mot de passe doit contenir au moins 8 caractères.");
    process.exit(1);
  }

  // Diagnostic : base réellement visée (le mot de passe n'est jamais affiché)
  try {
    const u = new URL(process.env.DATABASE_URL ?? "");
    console.log(
      `Base visée : utilisateur=${u.username || "(vide)"} hôte=${u.hostname} port=${u.port || "(défaut)"} base=${u.pathname}`
    );
  } catch {
    console.log("DATABASE_URL est absente ou mal formée.");
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await hash(motDePasse, 10);
    const admin = await prisma.admin.upsert({
      where: { email: email.toLowerCase() },
      update: { passwordHash, nom, failedAttempts: 0, lockedUntil: null },
      create: { email: email.toLowerCase(), passwordHash, nom },
    });
    console.log(`✔ Administrateur prêt : ${admin.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Code :", e.code ?? "(aucun)");
  console.error(
    "Détail :",
    String(e.message).split("\n").filter(Boolean).slice(-4).join("\n")
  );
  process.exit(1);
});