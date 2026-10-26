// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { db } from "@/db";
import { cases, messages, users } from "@/db/schema";
import { SakDetalj } from "../Detail";
import { seedParter, tomDb } from "@/test/db";
import { lagRequestInfo } from "@/test/request-info";

vi.mock("@/db", async () => ({ db: (await import("@/test/db")).lagTestDb() }));
// Klientkomponentene på sida importerer server actions, som hører til serveren.
vi.mock("@/actions/saker", () => ({
  sendMelding: vi.fn(),
  oppdaterStatus: vi.fn(),
  avbrytSak: vi.fn(),
}));

async function visSak(rolle: string, id: string) {
  const info = lagRequestInfo(`http://localhost/saker/${id}?rolle=${rolle}`, { id });
  render(await SakDetalj(info));
  return info;
}

async function meldInnSak() {
  const { leietaker, utleier } = await seedParter(db);
  const [sak] = await db
    .insert(cases)
    .values({
      title: "Vannlekkasje under kjøkkenvasken",
      description: "Det drypper fra røret under vasken.",
      category: "pipes",
      priority: "high",
      tenantId: leietaker.id,
      landlordId: utleier.id,
    })
    .returning();
  return { sak, leietaker, utleier };
}

describe("/saker/:id", () => {
  beforeEach(() => tomDb(db));

  it("leietakeren ser saken, meldingene og kan avbryte", async () => {
    const { sak, utleier } = await meldInnSak();
    await db.insert(messages).values({ caseId: sak.id, senderId: utleier.id, body: "Jeg ringer rørleggeren." });

    const info = await visSak("tenant", sak.id);

    expect(info.response.status).toBe(200);
    expect(screen.getByRole("heading", { name: "Vannlekkasje under kjøkkenvasken" })).toBeInTheDocument();
    expect(screen.getByText("Ola Utleier")).toBeInTheDocument();
    expect(screen.getByText("Jeg ringer rørleggeren.")).toBeInTheDocument();
    expect(screen.getByText(/^Ola Utleier,/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Avbryt saken" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Ny status")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tilbake til sakene" })).toHaveAttribute("href", "/saker?rolle=tenant");
  });

  it("utleieren får neste steg som valg, og ingen avbryt-knapp", async () => {
    const { sak } = await meldInnSak();

    await visSak("landlord", sak.id);

    expect(screen.getByLabelText("Ny status")).toHaveDisplayValue("Under arbeid");
    expect(screen.queryByRole("button", { name: "Avbryt saken" })).not.toBeInTheDocument();
    expect(screen.getByText("Ingen meldinger ennå")).toBeInTheDocument();
  });

  it("ukjent sak gir 404", async () => {
    await seedParter(db);

    const info = await visSak("tenant", "finnes-ikke");

    expect(info.response.status).toBe(404);
    expect(screen.getByText("Fant ikke saken")).toBeInTheDocument();
  });

  it("en som ikke er part i saken får 403", async () => {
    // Den første utleieren i databasen blir «innlogget» med ?rolle=landlord.
    await db.insert(users).values({ name: "Per Utleier", email: "per@example.com", role: "landlord" });
    const { sak } = await meldInnSak();

    const info = await visSak("landlord", sak.id);

    expect(info.response.status).toBe(403);
    expect(screen.getByText("Ingen tilgang")).toBeInTheDocument();
  });
});
