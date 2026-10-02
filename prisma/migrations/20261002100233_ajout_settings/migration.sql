-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "nomOrganisation" TEXT NOT NULL DEFAULT 'SecuriApp',
    "dureeValiditeJours" INTEGER NOT NULL DEFAULT 365,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
