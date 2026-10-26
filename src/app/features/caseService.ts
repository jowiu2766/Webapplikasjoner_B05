import { db } from "@/db";
import { caseRepository, type CaseRepository } from "./caseRepository";
import type { CreateCaseInput } from "./caseSchema";
import type { Case } from "@/db/schema";
import type { Result } from "@/types/result";

export interface CaseService {
  create(input: CreateCaseInput): Promise<Result<Case>>;
}

export function createCaseService(caseRepository: CaseRepository): CaseService {
  return {
    async create(input) {
      // Midlertidig til innlogging finnes: bruker de seedede testbrukerne.
      const [tenant, landlord] = await Promise.all([
        db.query.user.findFirst({ where: { role: "tenant" } }),
        db.query.user.findFirst({ where: { role: "landlord" } }),
      ]);
      if (!tenant || !landlord) {
        return {
          success: false,
          error: { message: "Fant ingen testbrukere. Kjør npm run seed.", code: "INTERNAL_SERVER_ERROR" },
        };
      }

      const result = await caseRepository.create({
        ...input,
        tenantId: tenant.id,
        landlordId: landlord.id,
      });
      return { success: true, data: result };
    },
  };
}

export const caseService = createCaseService(caseRepository);
