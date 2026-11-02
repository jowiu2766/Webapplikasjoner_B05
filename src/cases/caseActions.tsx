"use server";

import { ResultHandler } from "@/lib/utils/result";
import { createCaseSchema } from "./caseSchema";
import { caseService } from "./caseService";
import type { Case } from "@/db/schema";
import { Result } from "@/types/result";
import { Errors } from "@/types/errors";
import { requestInfo } from "rwsdk/worker";

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
  const user = requestInfo.ctx.user;

  if (!user)
    return ResultHandler.failure("Du må være logget inn", Errors.UNAUTHORIZED);
  if (user.role !== "Tenant")
    return ResultHandler.failure(
      "Bare leietakere kan opprette saker",
      Errors.FORBIDDEN,
    );

  if (!validation.success) {
    return ResultHandler.failure(
      validation.error.issues[0].message,
      Errors.VALIDATION_ERROR,
    );
  }

  return caseService.create(validation.data, user);
}
