import { getDb } from "@/db";
import { caseRepository, type CaseRepository } from "./caseRepository";
import type { CreateCaseInput } from "./caseSchema";
import type { Case, CreateCase } from "@/db/schema";
import { Result } from "@/types/result";
import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";

export interface CaseService {
  create(input: CreateCaseInput): Promise<Result<Case>>;
}

export function createCaseService(caseRepository: CaseRepository): CaseService {
  return {
    async create(input) {
      try{
          const db = await getDb();
          const [tenant, landlord] = await Promise.all([
            db.query.user.findFirst({ where: { role: "Tenant" } }),
            db.query.user.findFirst({ where: { role: "Landlord" } }),
      ]);

      if (!tenant || !landlord) {
        return ResultHandler.failure(
          "Didntr find any testUsers, run Seed.",
          Errors.INTERNAL_SERVER_ERROR
        )
      };
      
      // Midlertidig til innlogging finnes - bruker seedet testbruker - Claude hjalp her
     return await caseRepository.create({
      ...input,
      tenantId: tenant.id,
      landlordId: landlord.id
     });
    }catch(error){
      console.error("Error Creating case:", error);
      return ResultHandler.failure("Failed to create case", Errors.INTERNAL_SERVER_ERROR)
    }
    },
  };
}

export const caseService = createCaseService(caseRepository);
