import { describe, it, expect } from "vitest";
import {
  harTilgang,
  kanEndreStatus,
  kanAvbryteSak,
  lovligeOverganger,
} from "../sak-status";

describe("lovligeOverganger", () => {
  it("utleier flytter saken ett steg fram", () => {
    expect(lovligeOverganger("open", "Landlord")).toEqual(["in_progress"]);
    expect(lovligeOverganger("in_progress", "Landlord")).toEqual(["pending"]);
    expect(lovligeOverganger("pending", "Landlord")).toEqual(["awaiting_confirmation"]);
    expect(lovligeOverganger("awaiting_confirmation", "Landlord")).toEqual(["closed"]);
  });

  it("en lukket sak kan ikke endres", () => {
    expect(lovligeOverganger("closed", "Landlord")).toEqual([]);
    expect(lovligeOverganger("closed", "Tenant")).toEqual([]);
  });

  it("leietaker kan bare avbryte en åpen sak", () => {
    expect(lovligeOverganger("open", "Tenant")).toEqual(["closed"]);
    expect(lovligeOverganger("in_progress", "Tenant")).toEqual([]);
  });
});

describe("kanEndreStatus", () => {
  it("avviser hopp over steg", () => {
    expect(kanEndreStatus("open", "closed", "Landlord")).toBe(false);
    expect(kanEndreStatus("open", "in_progress", "Landlord")).toBe(true);
  });
});

describe("kanAvbryteSak", () => {
  it("bare leietaker, bare åpen sak", () => {
    expect(kanAvbryteSak("open", "Tenant")).toBe(true);
    expect(kanAvbryteSak("pending", "Tenant")).toBe(false);
    expect(kanAvbryteSak("open", "Landlord")).toBe(false);
  });
});

describe("harTilgang", () => {
  const sak = { tenantId: "u1", landlordId: "u2" };

  it("leietaker og utleier på saken har tilgang", () => {
    expect(harTilgang({ id: "u1" }, sak)).toBe(true);
    expect(harTilgang({ id: "u2" }, sak)).toBe(true);
  });

  it("andre har ikke tilgang", () => {
    expect(harTilgang({ id: "u3" }, sak)).toBe(false);
  });
});
