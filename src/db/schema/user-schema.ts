import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";
import { userRoles } from "@/lib/enums";

// brukere
export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  // leietaker eller utleier
  role: text({ enum: userRoles }).notNull().default("tenant"),
});

// Typen utledes FRA tabellen, så den kan aldri komme i utakt med skjemaet.
export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
