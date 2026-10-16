import { db } from "@/db";
import type { User } from "@/db/schema";
import type { SakFilter } from "@/lib/sak-filter";

// sakene en bruker får se, nyeste først
export function listSaker(bruker: User, filter: SakFilter = {}) {
  const eier =
    bruker.role === "landlord"
      ? { landlordId: bruker.id }
      : { tenantId: bruker.id };

  return db.query.cases.findMany({
    where: { ...eier, status: filter.status, priority: filter.prioritet },
    with: { tenant: true },
    orderBy: { createdAt: "desc" },
  });
}
