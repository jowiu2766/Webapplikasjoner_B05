import { describe, it, expect, vi } from "vitest";
import type { Case, SafeUser } from "@/db/schema";
import type { CaseRepository } from "@/cases/caseRepository";
import type { CreateCaseInput } from "@/cases/caseSchema";
import { createCaseService } from "@/cases/caseService";
import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";

const leietaker: SafeUser = {
  id: "leietaker-1",
  name: "Test Leietaker",
  email: "leietaker@example.com",
  emailVerified: false,
  role: "Tenant",
  image: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  lastLoginAt: null,
  isActive: true,
  address: "Testveien 1",
};

const input: CreateCaseInput = {
  title: "Lekkasje under vasken",
  category: "pipes",
  priority: "high",
  description: "Det drypper fra røret.",
  deadline: new Date("2030-01-01"),
};

const lagretSak: Case = {
  id: "sak-1",
  title: input.title,
  description: input.description,
  category: input.category,
  priority: input.priority,
  deadline: input.deadline,
  status: "open",
  fileKey: null,
  tenantId: leietaker.id,
  landlordId: leietaker.id,
  createdAt: new Date("2026-11-01"),
  updatedAt: new Date("2026-11-01"),
};

//Et falskt repository, uten database, som bare returnerer det vi ber om. Brukes for å teste servicen isolert.
function lagRepository(create: CaseRepository["create"]): CaseRepository {
  return { create };
}

describe("caseService.create", () => {
  it("sender saken videre til repository med innlogget bruker som leietaker", async () => {
    const create = vi.fn().mockResolvedValue(ResultHandler.success(lagretSak));
    const service = createCaseService(lagRepository(create));

    await service.create(input, leietaker);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Lekkasje under vasken",
        category: "pipes",
        priority: "high",
        tenantId: "leietaker-1",
      }),
    );
  });

  it("gir tilbake saken som repository lagret", async () => {
    const create = vi.fn().mockResolvedValue(ResultHandler.success(lagretSak));
    const service = createCaseService(lagRepository(create));

    const result = await service.create(input, leietaker);

    expect(result).toEqual({ success: true, data: lagretSak });
  });

  it("gir feilen fra repository videre uten å endre den", async () => {
    const feil = ResultHandler.failure("Ikke lagret", Errors.NOT_FOUND);
    const create = vi.fn().mockResolvedValue(feil);
    const service = createCaseService(lagRepository(create));

    const result = await service.create(input, leietaker);

    expect(result).toBe(feil);
  });

  it("gir INTERNAL_SERVER_ERROR når repository kaster en feil", async () => {
    const stillFeillogg = vi.spyOn(console, "error").mockImplementation(() => {});
    const create = vi.fn().mockRejectedValue(new Error("databasen er nede"));
    const service = createCaseService(lagRepository(create));

    const result = await service.create(input, leietaker);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(result.error.message).toBe("Failed to create case");
    }
    stillFeillogg.mockRestore();
  });

  //Servicen setter i dag landlordId til den innloggede brukeren (leietakeren).
  //Når utleier kobles til saken, skal testen skrives om og slås på.
  it.todo("setter utleier fra saken, ikke fra den innloggede leietakeren");
});