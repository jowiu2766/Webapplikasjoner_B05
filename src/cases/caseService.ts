import { db } from "@/db";
import { caseRepository, type CaseRepository } from "./caseRepository";
import type { CreateCaseInput } from "./caseSchema";
import type { Case, CreateCase } from "@/db/schema";

export interface CaseService {
  create(input: CreateCaseInput): Promise<D1Result<Case>>;
}

export function createCaseService(caseRepository: CaseRepository): CaseService {
  return {
    async create(input: CreateCase) {
      // Midlertidig til innlogging finnes - bruker seedet testbruker - Claude hjalp her
      const [tenant, landlord] = await Promise.all([
        db.query.users.findFirst({ where: { role: "tenant" } }),
        db.query.users.findFirst({ where: { role: "landlord" } }),
      ]);

      if (!tenant || !landlord) {
        return {
          success: false,
          error: {
            message: "Fant ingen testbrukere. Kjør npm run seed.",
            code: 500,
          },
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
