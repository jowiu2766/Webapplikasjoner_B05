import z from "zod";
import { caseCategories, casePriorities } from "@/lib/enums";

export const createCaseSchema = z.object({
  title: z.string().trim().min(1, "Tittel må fylles ut").max(200),
  category: z.enum(caseCategories),
  priority: z.enum(casePriorities),
  description: z.string().trim().min(1, "Beskrivelse må fylles ut").max(500),
  deadline: z.coerce
    .date()
    .refine((date) => date > new Date(), "Tidsfristen må være fram i tid"),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
