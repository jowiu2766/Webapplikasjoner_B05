import z from "zod";
import { caseCategories, casePriorities } from "@/lib/enums";

export const createCaseSchema = z.object({
  title: z.string().trim().min(1, "Tittel må fylles ut").max(200),
  category: z.enum(caseCategories, "Kategori må velges"),
  priority: z.enum(casePriorities, "Prioritet må velges"),
  description: z.string().trim().min(1, "Beskrivelse må fylles ut").max(500),
  deadline: z.coerce
    .date()
    .refine((date) => date > new Date(), "Tidsfristen må være fram i tid"),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
