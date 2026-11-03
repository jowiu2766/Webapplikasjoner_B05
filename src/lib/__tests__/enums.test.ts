import { describe, it, expect } from "vitest";
import {
  caseCategories,
  casePriorities,
  caseStatuses,
  categoryLabels,
  priorityLabels,
  statusLabels,
} from "@/lib/enums";

describe("kategorier", () => {
  it("har sju kategorier", () => {
    expect(caseCategories).toHaveLength(7);
  });

  it("har en norsk etikett for hver kategori", () => {
    for (const kategori of caseCategories) {
      expect(categoryLabels[kategori]).toBeTruthy();
    }
  });

  it("viser water_damage som Vannskade", () => {
    expect(categoryLabels.water_damage).toBe("Vannskade");
  });
});

describe("prioriteter", () => {
  it("har fire prioriteter", () => {
    expect(casePriorities).toHaveLength(4);
  });

  it("har en norsk etikett for hver prioritet", () => {
    for (const prioritet of casePriorities) {
      expect(priorityLabels[prioritet]).toBeTruthy();
    }
  });

  it("viser critical som Kritisk", () => {
    expect(priorityLabels.critical).toBe("Kritisk");
  });
});

describe("statuser", () => {
  it("har fem statuser", () => {
    expect(caseStatuses).toHaveLength(5);
  });

  it("har en norsk etikett for hver status", () => {
    for (const status of caseStatuses) {
      expect(statusLabels[status]).toBeTruthy();
    }
  });

  it("starter på open og slutter på closed", () => {
    expect(caseStatuses[0]).toBe("open");
    expect(caseStatuses[caseStatuses.length - 1]).toBe("closed");
  });
});