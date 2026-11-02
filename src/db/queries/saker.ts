import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  cases,
  messages,
  SafeUser,
  type Case,
  type CreateCase,
  type CreateMessage,
} from "@/db/schema";
import type { CaseStatus } from "@/lib/enums";
import type { SakFilter } from "@/lib/sak-filter";

// sakene en bruker får se, nyeste først
export async function listSaker(bruker: SafeUser, filter: SakFilter = {}) {
  const db = await getDb();
  const eier =
    bruker.role === "Landlord"
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
  const db = await getDb();

  const [newCase] = await db.insert(cases).values(data).returning();
  return newCase;
}
export async function hentSak(id: string) {
  const db = await getDb();

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
  const db = await getDb();
  const [melding] = await db.insert(messages).values(data).returning();
  return melding;
}

export async function settStatus(id: string, status: CaseStatus) {
  const db = await getDb();

  const [sak] = await db
    .update(cases)
    .set({ status })
    .where(eq(cases.id, id))
    .returning();
  return sak;
}
