import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user-schema";
import { createId } from "@/lib/id";
import { caseCategories, casePriorities, caseStatuses } from "@/lib/enums";

// en sak
export const cases = sqliteTable(
  "cases",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category", { enum: caseCategories }).notNull(),
    priority: text("priority", { enum: casePriorities }).notNull(),
    status: text("status", { enum: caseStatuses }).notNull().default("open"),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    landlordId: integer("landlord_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
  },
  (table) => [
    index("idx_cases_tenant_id").on(table.tenantId),
    index("idx_cases_landlord_id").on(table.landlordId),
  ]
);

export type Case = typeof cases.$inferSelect;
export type CreateCase = typeof cases.$inferInsert;
