import type { CaseStatus, UserRole } from "./enums";

// overgangene fra docs/arkitektur.md
const nesteSteg: Partial<Record<CaseStatus, CaseStatus>> = {
  open: "in_progress",
  in_progress: "pending",
  pending: "awaiting_confirmation",
  awaiting_confirmation: "closed",
};

export function lovligeOverganger(fra: CaseStatus, rolle: UserRole): CaseStatus[] {
  if (rolle === "landlord") {
    const neste = nesteSteg[fra];
    return neste ? [neste] : [];
  }
  return fra === "open" ? ["closed"] : [];
}

export function kanEndreStatus(fra: CaseStatus, til: CaseStatus, rolle: UserRole) {
  return lovligeOverganger(fra, rolle).includes(til);
}

export function kanAvbryteSak(status: CaseStatus, rolle: UserRole) {
  return rolle === "tenant" && status === "open";
}

export function harTilgang(
  bruker: { id: string },
  sak: { tenantId: string; landlordId: string }
) {
  return bruker.id === sak.tenantId || bruker.id === sak.landlordId;
}
