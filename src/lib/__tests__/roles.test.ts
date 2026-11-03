import { describe, it, expect } from "vitest";
import type { SafeUser, UserRole } from "@/db/schema";
import { getRole, hasRole, isAdmin, isUser } from "@/lib/auth/roles";

function lagBruker(role: UserRole): SafeUser {
  return {
    id: "bruker-1",
    name: "Test Bruker",
    email: "test@example.com",
    emailVerified: false,
    role,
    image: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    lastLoginAt: null,
    isActive: true,
    address: "Testveien 1",
  };
}

describe("getRole", () => {
  it("gir rollen til en innlogget bruker", () => {
    expect(getRole(lagBruker("Tenant"))).toBe("Tenant");
    expect(getRole(lagBruker("Landlord"))).toBe("Landlord");
  });

  it("gir Unauthenticated når ingen er logget inn", () => {
    expect(getRole(null)).toBe("Unauthenticated");
    expect(getRole(undefined)).toBe("Unauthenticated");
  });
});

describe("hasRole", () => {
  it("er sann når brukeren har rollen", () => {
    expect(hasRole(lagBruker("Landlord"), "Landlord")).toBe(true);
  });

  it("er usann når brukeren har en annen rolle", () => {
    expect(hasRole(lagBruker("Tenant"), "Landlord")).toBe(false);
  });

  it("behandler en manglende bruker som Unauthenticated", () => {
    expect(hasRole(null, "Unauthenticated")).toBe(true);
    expect(hasRole(undefined, "Tenant")).toBe(false);
  });
});

describe("isAdmin", () => {
  it("er bare sann for Admin", () => {
    expect(isAdmin(lagBruker("Admin"))).toBe(true);
    expect(isAdmin(lagBruker("Landlord"))).toBe(false);
    expect(isAdmin(lagBruker("Tenant"))).toBe(false);
  });

  it("er usann uten innlogging", () => {
    expect(isAdmin(null)).toBe(false);
  });
});

describe("isUser", () => {
  it("er sann for enhver innlogget bruker", () => {
    expect(isUser(lagBruker("Tenant"))).toBe(true);
  });

  it("er usann uten innlogging", () => {
    expect(isUser(null)).toBe(false);
  });
});
