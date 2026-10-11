import { sqliteTable, text, int, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@/lib/utils/id";
import { relations } from "drizzle-orm";


/**
 * Eksempeltabell. Bytt den ut med deres egen datamodell.
 */
export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  role: text("role", { enum: ["Unauthenticated", "Tenant", "Landlord", "Admin"] })

});

export const sessions = sqliteTable("sessions", {
   id: text("id").primaryKey().$defaultFn(() => createId()),
   userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
   expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
   createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const USER_ROLES = ["Unauthenticated","Tenant","Landlord","Admin" ] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Typen utledes FRA tabellen, så den kan aldri komme i utakt med skjemaet.
export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;

//export type UserRole = "Unauthenticated" | "Tenant" | "Landlord" | "Admin";

export type SafeUser = Omit<User, "passwordHash">