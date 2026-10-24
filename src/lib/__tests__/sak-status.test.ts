import { describe, it, expect } from "vitest";
import {
  harTilgang,
  kanEndreStatus,
  kanAvbryteSak,
  lovligeOverganger,
} from "../sak-status";

describe("lovligeOverganger", () => {
  it("utleier flytter saken ett steg fram", () => {
    expect(lovligeOverganger("open", "landlord")).toEqual(["in_progress"]);
    expect(lovligeOverganger("in_progress", "landlord")).toEqual(["pending"]);
    expect(lovligeOverganger("pending", "landlord")).toEqual(["awaiting_confirmation"]);
    expect(lovligeOverganger("awaiting_confirmation", "landlord")).toEqual(["closed"]);
  });

  it("en lukket sak kan ikke endres", () => {
    expect(lovligeOverganger("closed", "landlord")).toEqual([]);
    expect(lovligeOverganger("closed", "tenant")).toEqual([]);
  });

  it("leietaker kan bare avbryte en åpen sak", () => {
    expect(lovligeOverganger("open", "tenant")).toEqual(["closed"]);
    expect(lovligeOverganger("in_progress", "tenant")).toEqual([]);
  });
});

describe("kanEndreStatus", () => {
  it("avviser hopp over steg", () => {
    expect(kanEndreStatus("open", "closed", "landlord")).toBe(false);
    expect(kanEndreStatus("open", "in_progress", "landlord")).toBe(true);
  });
});

describe("kanAvbryteSak", () => {
  it("bare leietaker, bare åpen sak", () => {
    expect(kanAvbryteSak("open", "tenant")).toBe(true);
    expect(kanAvbryteSak("pending", "tenant")).toBe(false);
    expect(kanAvbryteSak("open", "landlord")).toBe(false);
  });
});

describe("harTilgang", () => {
  const sak = { tenantId: 1, landlordId: 2 };

  it("leietaker og utleier på saken har tilgang", () => {
    expect(harTilgang({ id: 1 }, sak)).toBe(true);
    expect(harTilgang({ id: 2 }, sak)).toBe(true);
  });

  it("andre har ikke tilgang", () => {
    expect(harTilgang({ id: 3 }, sak)).toBe(false);
  });
});
