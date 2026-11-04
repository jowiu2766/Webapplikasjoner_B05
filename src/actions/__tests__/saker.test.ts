import { describe, it, expect, vi, beforeEach } from "vitest";
import { cases, type SafeUser } from "@/db/schema";
import { avbrytSak, oppdaterStatus, sendMelding } from "../saker";
import { frist, nyBruker, seedParter, tomDb } from "@/test/db";

const db = await vi.hoisted(async () => (await import("@/test/db")).lagTestDb());
vi.mock("@/db", () => ({ getDb: async () => db }));

// Hvem som spør settes per test, slik Authentication-middlewaren setter ctx.user.
const aktiv = vi.hoisted(() => ({ bruker: null as SafeUser | null }));
vi.mock("rwsdk/worker", () => ({
  requestInfo: {
    ctx: {
      get user() {
        return aktiv.bruker;
      },
    },
  },
}));

async function meldInnSak() {
  const { leietaker, utleier } = await seedParter(db);
  const [sak] = await db
    .insert(cases)
    .values({ title: "Vannlekkasje", description: "x", category: "pipes", priority: "high", deadline: frist, tenantId: leietaker.id, landlordId: utleier.id })
    .returning();
  return { sak, leietaker, utleier };
}

describe("sendMelding", () => {
  beforeEach(async () => {
    await tomDb(db);
    aktiv.bruker = null;
  });

  it("lagrer meldinga med den som spør som avsender", async () => {
    const { sak, leietaker } = await meldInnSak();
    aktiv.bruker = leietaker;

    expect(await sendMelding(sak.id, "  Hei  ")).toEqual({ ok: true });

    const lagret = await db.query.messages.findMany({ where: { caseId: sak.id } });
    expect(lagret).toHaveLength(1);
    expect(lagret[0].body).toBe("Hei");
    expect(lagret[0].senderId).toBe(leietaker.id);
  });

  it("avviser en tom melding", async () => {
    const { sak, leietaker } = await meldInnSak();
    aktiv.bruker = leietaker;

    expect(await sendMelding(sak.id, "   ")).toEqual({ ok: false, error: "Meldingen kan ikke være tom" });
  });

  it("avviser en som ikke er part i saken", async () => {
    const { sak } = await meldInnSak();
    aktiv.bruker = await nyBruker(db, { name: "Nina Nabo", email: "nina@example.com", role: "Tenant" });

    expect(await sendMelding(sak.id, "Hei")).toEqual({ ok: false, error: "Ingen tilgang til saken" });
    expect(await db.query.messages.findMany()).toHaveLength(0);
  });

  it("avviser når ingen er logget inn", async () => {
    const { sak } = await meldInnSak();

    expect(await sendMelding(sak.id, "Hei")).toEqual({ ok: false, error: "Ingen tilgang til saken" });
  });
});

describe("oppdaterStatus", () => {
  beforeEach(() => tomDb(db));

  it("utleier flytter saken ett steg", async () => {
    const { sak, utleier } = await meldInnSak();
    aktiv.bruker = utleier;

    expect(await oppdaterStatus(sak.id, "in_progress")).toEqual({ ok: true });
    expect((await db.query.cases.findFirst({ where: { id: sak.id } }))?.status).toBe("in_progress");
  });

  it("avviser hopp over steg og ukjente statuser", async () => {
    const { sak, utleier } = await meldInnSak();
    aktiv.bruker = utleier;

    expect(await oppdaterStatus(sak.id, "closed")).toEqual({ ok: false, error: "Den overgangen er ikke lov" });
    expect(await oppdaterStatus(sak.id, "tull")).toEqual({ ok: false, error: "Ugyldig status" });
  });

  it("leietaker får ikke endre status", async () => {
    const { sak, leietaker } = await meldInnSak();
    aktiv.bruker = leietaker;

    expect(await oppdaterStatus(sak.id, "in_progress")).toEqual({ ok: false, error: "Den overgangen er ikke lov" });
  });
});

describe("avbrytSak", () => {
  beforeEach(() => tomDb(db));

  it("leietaker avbryter en åpen sak, og den blir lukket", async () => {
    const { sak, leietaker } = await meldInnSak();
    aktiv.bruker = leietaker;

    expect(await avbrytSak(sak.id)).toEqual({ ok: true });
    expect((await db.query.cases.findFirst({ where: { id: sak.id } }))?.status).toBe("closed");
  });

  it("utleier kan ikke avbryte", async () => {
    const { sak, utleier } = await meldInnSak();
    aktiv.bruker = utleier;

    expect(await avbrytSak(sak.id)).toEqual({ ok: false, error: "Bare en åpen sak kan avbrytes" });
  });

  it("ukjent sak gir ingen tilgang", async () => {
    const { leietaker } = await seedParter(db);
    aktiv.bruker = leietaker;

    expect(await avbrytSak("finnes-ikke")).toEqual({ ok: false, error: "Ingen tilgang til saken" });
  });
});
