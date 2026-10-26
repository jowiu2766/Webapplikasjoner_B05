import { db } from "@/db";
import { cases } from "@/db/schema";
import type { Case, CreateCase } from "@/db/schema";

export interface CaseRepository {
  create(data: CreateCase): Promise<Case>;
}

export function createCaseRepository(_db: typeof db): CaseRepository {
  return {
    async create(data) {
      const [newCase] = await _db.insert(cases).values(data).returning();
      return newCase;
    },
  };
}

export const caseRepository = createCaseRepository(db);
