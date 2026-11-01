"use server";

import { ResultHandler } from "@/lib/utils/result";
import { createCaseSchema } from "./caseSchema";
import { caseService } from "./caseService";
import type { Case } from "@/db/schema";
import { Result } from "@/types/result";
import { Errors } from "@/types/errors";

// Må legge til deadline og filer her
export async function createCaseAction(
  title: string,
  category: string,
  priority: string,
  description: string,
  deadline: string,
): Promise<Result<Case>> {
  const validation = createCaseSchema.safeParse({
    title,
    category,
    priority,
    description,
    deadline,
  });

  // Må legge til bedre validering
  if (!validation.success) {
    return ResultHandler.failure(
      "Valideringsfeil - sjekk kategori og prioritet (de som for øyeblikket må fylles for å sende inn skjema)",
      Errors.VALIDATION_ERROR,
    );
  }

  return caseService.create(validation.data);
}
