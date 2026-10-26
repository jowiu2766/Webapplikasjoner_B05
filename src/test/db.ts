import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { db as prodDb } from "@/db";
import { relations } from "@/db/relations";
import { cases, messages, session, user } from "@/db/schema";
import { createId } from "@/lib/id";

// SQLite i minnet med de ekte migrasjonene, i stedet for D1. Brukes med:
//   vi.mock("@/db", async () => ({ db: (await import("@/test/db")).lagTestDb() }));
export function lagTestDb() {
  const sqlite = new Database(":memory:");
  // D1 håndhever fremmednøkler.
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle({ client: sqlite, relations });
  migrate(db, { migrationsFolder: "./drizzle/migrations" });
  return db;
}

// D1-typen, så testene kan sende db rett fra @/db.
type Db = typeof prodDb;

export async function tomDb(db: Db) {
  await db.delete(messages);
  await db.delete(cases);
  await db.delete(session);
  await db.delete(user);
}

export async function seedParter(db: Db) {
  const [leietaker] = await db
    .insert(user)
    .values({ id: createId(), name: "Kari Nordmann", email: "kari@example.com", role: "tenant" })
    .returning();
  const [utleier] = await db
    .insert(user)
    .values({ id: createId(), name: "Ola Utleier", email: "ola@example.com", role: "landlord" })
    .returning();
  return { leietaker, utleier };
}

// En sak slik seed.ts lager den, klar til db.insert(cases).
export function nySak(tenantId: string, landlordId: string, ekstra: Partial<typeof cases.$inferInsert> = {}) {
  return {
    title: "Vannlekkasje under kjøkkenvasken",
    description: "Det drypper fra røret under vasken.",
    category: "pipes" as const,
    priority: "high" as const,
    deadline: new Date("2026-11-10T12:00:00Z"),
    tenantId,
    landlordId,
    ...ekstra,
  };
}
