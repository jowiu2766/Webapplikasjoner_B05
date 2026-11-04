import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { DB } from "@/db";
import { relations } from "@/db/relations";
import { cases, messages, user } from "@/db/schema";

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
export type TestDb = ReturnType<typeof lagTestDb>;

export async function tomDb(db: TestDb) {
  await db.delete(messages);
  await db.delete(cases);
  await db.delete(user);
}

export async function seedParter(db: TestDb) {
  const [leietaker] = await db
    .insert(user)
    .values({ id: crypto.randomUUID(),name: "Kari Nordmann", email: "kari@example.com", role: "Tenant", passwordHash: "testHash", address: "TestRoad 1", })
    .returning();
  const [utleier] = await db
    .insert(user)
    .values({id: crypto.randomUUID(), name: "Ola Utleier", email: "ola@example.com", role: "Landlord",passwordHash: "testHash", address: "TestRoad 2", })
    .returning();
  return { leietaker, utleier };
}
