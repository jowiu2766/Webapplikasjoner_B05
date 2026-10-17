"use server";

import { createCaseSchema } from "./caseSchema";
import { caseService } from "./caseService";
import type { Case } from "@/db/schema";

// Må legge til deadline og filer her
export async function createCaseAction(
  title: string,
  category: string,
  priority: string,
  description: string,
): Promise<Result<Case>> {
  const validation = createCaseSchema.safeParse({
    title,
    category,
    priority,
    description,
  });

  // Må legge til bedre validering
  if (!validation.success) {
    return {
      success: false,
      error: {
        message:
          "Valideringsfeil - sjekk kategori og prioritet (de som for øyeblikket må fylles for å sende inn skjema)",
        code: 400,
      },
    };
  }

  return caseService.create(validation.data);
}
