import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecuriApp — Vérification d'identité",
  description: "Système de vérification des agents de sécurité",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}