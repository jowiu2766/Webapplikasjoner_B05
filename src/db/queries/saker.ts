import { eq } from "drizzle-orm";
import { db } from "@/db";
import { Case, cases, type CreateCase, type User } from "@/db/schema";
import type { CaseStatus } from "@/lib/enums";
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
export function hentSak(id: string) {
  return db.query.cases.findFirst({
    where: { id },
    with: {
      tenant: true,
      landlord: true,
      messages: { with: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export type SakMedMeldinger = NonNullable<Awaited<ReturnType<typeof hentSak>>>;

export async function leggTilMelding(data: CreateMessage) {
  const [melding] = await db.insert(messages).values(data).returning();
  return melding;
}

export async function settStatus(id: string, status: CaseStatus) {
  const [sak] = await db
    .update(cases)
    .set({ status })
    .where(eq(cases.id, id))
    .returning();
  return sak;
}

