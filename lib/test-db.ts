import { prisma } from "./db";
import { generateSecureToken } from "./token";

async function test() {
  const agent = await prisma.agent.create({
    data: {
      nom: "Diarra",
      prenom: "Ibrahim",
      matricule: "AG-001",
      agence: "Bamako Centre",
      cards: {
        create: {
          token: generateSecureToken(),
          statut: "actif",
        },
      },
    },
  });
  console.log("Agent créé avec succès :", agent);
}

test()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });