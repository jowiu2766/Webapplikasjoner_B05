import { db } from "@/db";
import { Case, cases, type CreateCase, type User } from "@/db/schema";
import type { SakFilter } from "@/lib/sak-filter";

// sakene en bruker får se, nyeste først
export function listSaker(bruker: User, filter: SakFilter = {}) {
  const eier =
    bruker.role === "landlord"
      ? { landlordId: bruker.id }
      : { tenantId: bruker.id };

  return db.query.cases.findMany({
    where: { ...eier, status: filter.status, priority: filter.prioritet },
    with: { tenant: true },
    orderBy: { createdAt: "desc" },
  });
}

// oppretter sak, sak havner i sakslisten
export async function createCase(data: CreateCase): Promise<Case> {
  const [newCase] = await db.insert(cases).values(data).returning();
  return newCase;
}
