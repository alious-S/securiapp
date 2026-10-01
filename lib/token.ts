import { randomUUID } from "crypto";

export function generateSecureToken(): string {
  return randomUUID();
}