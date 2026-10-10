"use server";

import { validateDescription } from "@/lib/validation";
import { requestInfo } from "rwsdk/worker";

// må legge til mer validering her + autentisering
export async function createCase(
  title: string,
  category: string,
  priority: string,
  description: string,
  deadLine: string,
) {
  const { ctx } = requestInfo;

  const validation = validateDescription(description);
  if (!validation.ok) {
    return { ok: false as const, error: validation.error };
  }

  // TODO: lagre i databasen - implementeres senere i utvikling når vi har gått gjennom mer i forelesninger
  return { ok: true };
}
