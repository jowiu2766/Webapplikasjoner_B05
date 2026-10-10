// const objekt for enum - kan nok integreres i case.ts senere i utviklingen
export const CaseCategory = {
  ELECTRICITY: "electricity",
  PIPES: "pipes",
  PESTS: "pests",
  WATER_DAMAGE: "water damage",
  MAINTENANCE_ISSUE: "maintenance issue",
  COMPLAINT: "complaint",
  OTHER: "other",
} as const;

export const PriorityType = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  SEVERE: "severe",
};

export type CaseCategory = (typeof CaseCategory)[keyof typeof CaseCategory];
export type PriorityType = (typeof PriorityType)[keyof typeof PriorityType];
