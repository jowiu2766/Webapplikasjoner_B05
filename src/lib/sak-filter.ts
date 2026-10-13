import { z } from "zod";
import { casePriorities, caseStatuses } from "./enums";

// filteret fra adressen, ?status=open&prioritet=high
const sakFilterSchema = z.object({
  status: z.enum(caseStatuses).optional(),
  prioritet: z.enum(casePriorities).optional(),
});

export type SakFilter = z.infer<typeof sakFilterSchema>;

export function parseSakFilter(searchParams: URLSearchParams): SakFilter {
  // tom verdi betyr ingen filter
  const result = sakFilterSchema.safeParse({
    status: searchParams.get("status") || undefined,
    prioritet: searchParams.get("prioritet") || undefined,
  });

  return result.success ? result.data : {};
}
