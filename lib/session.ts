import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken } from "@/lib/auth";

export async function getSession() {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}