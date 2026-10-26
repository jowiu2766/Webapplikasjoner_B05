import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/db";
import { cases, messages, user } from "@/db/schema";
import { hentSak, leggTilMelding, listSaker, settStatus } from "../saker";
import { nySak, seedParter, tomDb } from "@/test/db";

vi.mock("@/db", async () => ({ db: (await import("@/test/db")).lagTestDb() }));

describe("listSaker", () => {
  beforeEach(() => tomDb(db));

  it("en sak som meldes inn finnes igjen hos leietakeren og utleieren, ingen andre", async () => {
    const { leietaker, utleier } = await seedParter(db);
    const [annenUtleier] = await db
      .insert(user)
      .values({ id: "per", name: "Per Utleier", email: "per@example.com", role: "landlord" })
      .returning();

    await db.insert(cases).values(nySak(leietaker.id, utleier.id));

    const hosLeietaker = await listSaker(leietaker);
    expect(hosLeietaker).toHaveLength(1);
    expect(hosLeietaker[0].title).toBe("Vannlekkasje under kjøkkenvasken");
    expect(hosLeietaker[0].status).toBe("open");
    expect(hosLeietaker[0].tenant.name).toBe("Kari Nordmann");

    expect(await listSaker(utleier)).toHaveLength(1);
    expect(await listSaker(annenUtleier)).toHaveLength(0);
  });

  it("filtrerer på status og prioritet", async () => {
    const { leietaker, utleier } = await seedParter(db);
    const felles = nySak(leietaker.id, utleier.id);
    await db.insert(cases).values([
      { ...felles, title: "Åpen og høy", category: "pipes", priority: "high", status: "open" },
      { ...felles, title: "Lukket og høy", category: "pests", priority: "high", status: "closed" },
      { ...felles, title: "Åpen og lav", category: "other", priority: "low", status: "open" },
    ]);

    const titler = async (filter: Parameters<typeof listSaker>[1]) =>
      (await listSaker(leietaker, filter)).map((sak) => sak.title).sort();

    expect(await titler({ status: "open" })).toEqual(["Åpen og høy", "Åpen og lav"]);
    expect(await titler({ prioritet: "high" })).toEqual(["Lukket og høy", "Åpen og høy"]);
    expect(await titler({ status: "open", prioritet: "high" })).toEqual(["Åpen og høy"]);
    expect(await titler({})).toHaveLength(3);
  });

  it("nyeste sak først", async () => {
    const { leietaker, utleier } = await seedParter(db);
    const dag = 86_400_000;
    const felles = nySak(leietaker.id, utleier.id, { category: "other", priority: "low" });
    await db.insert(cases).values([
      { ...felles, title: "Gammel", createdAt: new Date(Date.now() - 3 * dag) },
      { ...felles, title: "Ny", createdAt: new Date() },
      { ...felles, title: "Mellom", createdAt: new Date(Date.now() - 1 * dag) },
    ]);

    const titler = (await listSaker(leietaker)).map((sak) => sak.title);
    expect(titler).toEqual(["Ny", "Mellom", "Gammel"]);
  });
});

describe("hentSak", () => {
  beforeEach(() => tomDb(db));

  it("gir saken med begge parter og meldingene, eldste først", async () => {
    const { leietaker, utleier } = await seedParter(db);
    const [sak] = await db
      .insert(cases)
      .values(nySak(leietaker.id, utleier.id))
      .returning();
    await db.insert(messages).values([
      { caseId: sak.id, senderId: leietaker.id, body: "Nyeste", createdAt: new Date("2026-10-22T12:00:00Z") },
      { caseId: sak.id, senderId: utleier.id, body: "Eldste", createdAt: new Date("2026-10-21T12:00:00Z") },
    ]);

    const hentet = await hentSak(sak.id);

    expect(hentet?.tenant.name).toBe("Kari Nordmann");
    expect(hentet?.landlord.name).toBe("Ola Utleier");
    expect(hentet?.messages.map((m) => m.body)).toEqual(["Eldste", "Nyeste"]);
    expect(hentet?.messages[0].sender.name).toBe("Ola Utleier");
  });

  it("gir ingenting for en ukjent id", async () => {
    expect(await hentSak("finnes-ikke")).toBeUndefined();
  });
});

describe("leggTilMelding og settStatus", () => {
  beforeEach(() => tomDb(db));

  it("lagrer meldinga og den nye statusen på saken", async () => {
    const { leietaker, utleier } = await seedParter(db);
    const [sak] = await db
      .insert(cases)
      .values(nySak(leietaker.id, utleier.id))
      .returning();

    const melding = await leggTilMelding({ caseId: sak.id, senderId: utleier.id, body: "På vei" });
    const oppdatert = await settStatus(sak.id, "in_progress");

    expect(melding.id).toBeTruthy();
    expect(melding.createdAt).toBeInstanceOf(Date);
    expect(oppdatert.status).toBe("in_progress");
    expect((await hentSak(sak.id))?.messages).toHaveLength(1);
  });
});
