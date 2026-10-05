import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "securiapp_session";
const DUREE_SECONDES = 60 * 60 * 24 * 7; // 7 jours

export type Session = { id: string; email: string; nom: string };

function cle() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET est manquant ou trop court (16 caractères minimum)."
    );
  }
  return new TextEncoder().encode(secret);
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: DUREE_SECONDES,
};

export async function createSessionToken(session: Session) {
  return new SignJWT({ email: session.email, nom: session.nom })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(cle());
}

export async function readSessionToken(
  token: string | undefined
): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, cle(), {
      algorithms: ["HS256"],
    });
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      email: String(payload.email ?? ""),
      nom: String(payload.nom ?? ""),
    };
  } catch {
    return null;
  }
}