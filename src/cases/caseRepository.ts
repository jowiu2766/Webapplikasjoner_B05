import { getDb, type DB } from "@/db";
import { cases } from "@/db/schema";
import type { Case, CreateCase } from "@/db/schema";
import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";
import { Result } from "@/types/result";

export interface CaseRepository {
  create(data: CreateCase): Promise<Result<Case>>;
}

export function createCaseRepository(
  getDatabase: () => Promise<DB> = getDb,
): CaseRepository {
  return {
    async create(data) {
      try {
        const db = await getDatabase();
        const [newCase] = await db.insert(cases).values(data).returning();
        return ResultHandler.success(newCase);
      } catch (error) {
        console.error("Error creating case:", error);
        return ResultHandler.failure(
          "Failed toc rease case",
          Errors.INTERNAL_SERVER_ERROR,
        );
      }
    },
  };
}

export const caseRepository = createCaseRepository();
