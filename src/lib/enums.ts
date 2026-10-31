// faste verdier for en sak, engelsk i databasen og norsk på skjermen
import { user, User } from "@/db/schema";

//export const userRoles = ["tenant", "landlord"] as const;
export type UserRole = (typeof user.role);

export const caseCategories = [
  "electricity",
  "pipes",
  "pests",
  "water_damage",
  "maintenance",
  "complaint",
  "other",
] as const;
export type CaseCategory = (typeof caseCategories)[number];

export const categoryLabels: Record<CaseCategory, string> = {
  electricity: "Strøm",
  pipes: "Rør",
  pests: "Skadedyr",
  water_damage: "Vannskade",
  maintenance: "Vedlikehold",
  complaint: "Klage",
  other: "Annet",
};

export const casePriorities = ["low", "medium", "high", "critical"] as const;
export type CasePriority = (typeof casePriorities)[number];

export const priorityLabels: Record<CasePriority, string> = {
  low: "Lav",
  medium: "Middels",
  high: "Høy",
  critical: "Kritisk",
};

export const caseStatuses = [
  "open",
  "in_progress",
  "pending",
  "awaiting_confirmation",
  "closed",
] as const;
export type CaseStatus = (typeof caseStatuses)[number];

export const statusLabels: Record<CaseStatus, string> = {
  open: "Åpen",
  in_progress: "Under arbeid",
  pending: "Venter",
  awaiting_confirmation: "Venter på bekreftelse",
  closed: "Lukket",
};
