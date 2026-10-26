import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/db";
import { cases, user } from "@/db/schema";
import { avbrytSak, oppdaterStatus, sendMelding } from "../saker";
import { nySak, seedParter, tomDb } from "@/test/db";

vi.mock("@/db", async () => ({ db: (await import("@/test/db")).lagTestDb() }));

// Hvem som spør styres per test, slik ?rolle= gjør det til innlogging er på plass.
const aktiv = vi.hoisted(() => ({ rolle: "tenant" }));
vi.mock("rwsdk/worker", () => ({
  requestInfo: {
    get request() {
      return new Request(`http://localhost/saker?rolle=${aktiv.rolle}`);
    },
  },
}));

async function meldInnSak() {
  const { leietaker, utleier } = await seedParter(db);
  const [sak] = await db
    .insert(cases)
    .values(nySak(leietaker.id, utleier.id))
    .returning();
  return { sak, leietaker, utleier };
}

describe("sendMelding", () => {
  beforeEach(async () => {
    await tomDb(db);
    aktiv.rolle = "tenant";
  });

  it("lagrer meldinga med den som spør som avsender", async () => {
    const { sak, leietaker } = await meldInnSak();

    expect(await sendMelding(sak.id, "  Hei  ")).toEqual({ ok: true });

    const lagret = await db.query.messages.findMany({ where: { caseId: sak.id } });
    expect(lagret).toHaveLength(1);
    expect(lagret[0].body).toBe("Hei");
    expect(lagret[0].senderId).toBe(leietaker.id);
  });

  it("avviser en tom melding", async () => {
    const { sak } = await meldInnSak();

    expect(await sendMelding(sak.id, "   ")).toEqual({ ok: false, error: "Meldingen kan ikke være tom" });
  });

  it("avviser en som ikke er part i saken", async () => {
    await db.insert(user).values({ id: "nina", name: "Nina Nabo", email: "nina@example.com", role: "tenant" });
    const { sak } = await meldInnSak();

    expect(await sendMelding(sak.id, "Hei")).toEqual({ ok: false, error: "Ingen tilgang til saken" });
    expect(await db.query.messages.findMany()).toHaveLength(0);
  });
});

describe("oppdaterStatus", () => {
  beforeEach(async () => {
    await tomDb(db);
    aktiv.rolle = "landlord";
  });

  it("utleier flytter saken ett steg", async () => {
    const { sak } = await meldInnSak();

    expect(await oppdaterStatus(sak.id, "in_progress")).toEqual({ ok: true });
    expect((await db.query.cases.findFirst({ where: { id: sak.id } }))?.status).toBe("in_progress");
  });

  it("avviser hopp over steg og ukjente statuser", async () => {
    const { sak } = await meldInnSak();

    expect(await oppdaterStatus(sak.id, "closed")).toEqual({ ok: false, error: "Den overgangen er ikke lov" });
    expect(await oppdaterStatus(sak.id, "tull")).toEqual({ ok: false, error: "Ugyldig status" });
  });

  it("leietaker får ikke endre status", async () => {
    const { sak } = await meldInnSak();
    aktiv.rolle = "tenant";

    expect(await oppdaterStatus(sak.id, "in_progress")).toEqual({ ok: false, error: "Den overgangen er ikke lov" });
  });
});

describe("avbrytSak", () => {
  beforeEach(async () => {
    await tomDb(db);
    aktiv.rolle = "tenant";
  });

  it("leietaker avbryter en åpen sak, og den blir lukket", async () => {
    const { sak } = await meldInnSak();

    expect(await avbrytSak(sak.id)).toEqual({ ok: true });
    expect((await db.query.cases.findFirst({ where: { id: sak.id } }))?.status).toBe("closed");
  });

  it("utleier kan ikke avbryte", async () => {
    const { sak } = await meldInnSak();
    aktiv.rolle = "landlord";

    expect(await avbrytSak(sak.id)).toEqual({ ok: false, error: "Bare en åpen sak kan avbrytes" });
  });

  it("ukjent sak gir ingen tilgang", async () => {
    await seedParter(db);

    expect(await avbrytSak("finnes-ikke")).toEqual({ ok: false, error: "Ingen tilgang til saken" });
  });
});
