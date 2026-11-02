import z from "zod";
import { caseCategories, casePriorities } from "@/lib/enums";

export const createCaseSchema = z.object({
  title: z.string(),
  category: z.enum(caseCategories),
  priority: z.enum(casePriorities),
  description: z.string(),
  deadline: z.coerce.date(),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
