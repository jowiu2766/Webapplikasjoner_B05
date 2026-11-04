import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { relations } from "@/db/relations";
import { cases, messages, user, type UserRole } from "@/db/schema";

// SQLite i minnet med de ekte migrasjonene, i stedet for D1. Brukes med:
//   const db = await vi.hoisted(async () => (await import("@/test/db")).lagTestDb());
//   vi.mock("@/db", () => ({ getDb: async () => db }));
export function lagTestDb() {
  const sqlite = new Database(":memory:");
  // D1 håndhever fremmednøkler.
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle({ client: sqlite, relations });
  migrate(db, { migrationsFolder: "./drizzle/migrations" });
  return db;
}

export type TestDb = ReturnType<typeof lagTestDb>;

export async function tomDb(db: TestDb) {
  await db.delete(messages);
  await db.delete(cases);
  await db.delete(user);
}

export async function nyBruker(
  db: TestDb,
  bruker: { name: string; email: string; role: UserRole },
) {
  const [rad] = await db
    .insert(user)
    .values({ id: crypto.randomUUID(), passwordHash: "testHash", address: "Testveien 3", ...bruker })
    .returning();
  return rad;
}

export async function seedParter(db: TestDb) {
  const leietaker = await nyBruker(db, { name: "Kari Nordmann", email: "kari@example.com", role: "Tenant" });
  const utleier = await nyBruker(db, { name: "Ola Utleier", email: "ola@example.com", role: "Landlord" });
  return { leietaker, utleier };
}

// en frist fram i tid, til saker i testene
export const frist = new Date("2026-12-01T12:00:00Z");
