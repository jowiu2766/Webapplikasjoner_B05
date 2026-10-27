import { db } from "@/db";
import { cases } from "@/db/schema";
import type { Case, CreateCase } from "@/db/schema";
import { Result } from "@/types/result";

export interface CaseRepository {
  create(data: CreateCase): Promise<Result<Case>>;
}

export function createCaseRepository(_db: typeof db): CaseRepository {
  return {
    async create(data: CreateCase) {
      const [newCase] = await _db.insert(cases).values(data).returning();
      return newCase;
    },
  };
}

export const caseRepository = createCaseRepository(await db);
