-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "agence" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'actif',
    "expireAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" TEXT NOT NULL,
    "resultat" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "cardId" TEXT,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_matricule_key" ON "Agent"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Card_token_key" ON "Card"("token");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;
