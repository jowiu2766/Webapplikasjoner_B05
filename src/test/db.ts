import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { db as prodDb } from "@/db";
import { relations } from "@/db/relations";
import { cases, messages, users } from "@/db/schema";

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
  await db.delete(users);
}

export async function seedParter(db: Db) {
  const [leietaker] = await db
    .insert(users)
    .values({ name: "Kari Nordmann", email: "kari@example.com", role: "tenant" })
    .returning();
  const [utleier] = await db
    .insert(users)
    .values({ name: "Ola Utleier", email: "ola@example.com", role: "landlord" })
    .returning();
  return { leietaker, utleier };
}
