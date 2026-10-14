/** LOGO DE L'ENTREPRISE : servi comme une vraie image, gardée en mémoire par le navigateur. */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const modele = await prisma.modeleCarte.findUnique({
    where: { id: "main" },
    select: { logoUrl: true },
  });
  const trouve = modele?.logoUrl?.match(
    /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/
  );
  if (!trouve) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(Buffer.from(trouve[2], "base64")), {
    headers: {
      "Content-Type": trouve[1],
      // L'adresse change à chaque nouveau logo (?v=...), donc on peut garder longtemps
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}