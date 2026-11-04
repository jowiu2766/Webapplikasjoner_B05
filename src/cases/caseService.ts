import { caseRepository, type CaseRepository } from "./caseRepository";
import type { CreateCaseInput } from "./caseSchema";
import { type Case, type SafeUser } from "@/db/schema";
import { Result } from "@/types/result";
import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";

export interface CaseService {
  create(input: CreateCaseInput, user: SafeUser): Promise<Result<Case>>;
}

export function createCaseService(caseRepository: CaseRepository): CaseService {
  return {
    async create(input, user) {
      try {
        return await caseRepository.create({
          ...input,
          tenantId: user.id,
          landlordId: user.id,
        });
      } catch (error) {
        console.error("Error creating case:", error);
        return ResultHandler.failure(
          "Failed to create case",
          Errors.INTERNAL_SERVER_ERROR,
        );
      }
    },
  };
}

export const caseService = createCaseService(caseRepository);
