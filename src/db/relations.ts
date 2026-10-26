// Relations v2, som er måten Drizzle v1 gjør det på: alle relasjoner i ETT
// kall, ikke per tabell med `relations()` slik det var i 0.x. Objektet sendes
// til drizzle(..., { relations }) i ./index.ts, og er det som gjør at
// db.query.cases.findFirst({ with: { tenant: true } }) virker.
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  user: {
    tenantCases: r.many.cases({ from: r.user.id, to: r.cases.tenantId }),
    landlordCases: r.many.cases({ from: r.user.id, to: r.cases.landlordId }),
    messages: r.many.messages({ from: r.user.id, to: r.messages.senderId }),
    sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
  },
  session: {
    user: r.one.user({ from: r.session.userId, to: r.user.id, optional: false }),
  },
  cases: {
    tenant: r.one.user({ from: r.cases.tenantId, to: r.user.id, optional: false }),
    landlord: r.one.user({ from: r.cases.landlordId, to: r.user.id, optional: false }),
    messages: r.many.messages({ from: r.cases.id, to: r.messages.caseId }),
  },
  messages: {
    case: r.one.cases({ from: r.messages.caseId, to: r.cases.id, optional: false }),
    sender: r.one.user({ from: r.messages.senderId, to: r.user.id, optional: false }),
  },
}));

export type Relations = typeof relations;
