import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { cases } from "./case-schema";
import { users } from "./user-schema";
import { createId } from "@/lib/id";

export const messages = sqliteTable(
  "messages",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),
    caseId: text("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    senderId: integer("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
  },
  (table) => [index("idx_messages_case_id").on(table.caseId)]
);

export type Message = typeof messages.$inferSelect;
export type CreateMessage = typeof messages.$inferInsert;
