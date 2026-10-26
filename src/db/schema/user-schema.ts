import { sqliteTable, text, int, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@/lib/id";
import { relations } from "drizzle-orm/_relations";
import { userRoles } from "@/lib/enums";

// brukere
export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["Unauthenticated", "Tenant", "Landlord", "Admin"] }).notNull().default("Unauthenticated"),
  isActive: integer("is_active", {mode: "boolean"}).notNull().default(true),
  lastLoginAt: integer("last_login_at", {mode: "timestamp"}),
  createdAt: integer("created_at", {mode:"timestamp"}).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", {mode: "timestamp"}).$onUpdateFn(() => new Date()),
});

// Typen utledes FRA tabellen, så den kan aldri komme i utakt med skjemaet.
export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
