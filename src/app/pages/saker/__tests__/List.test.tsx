// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { cases, type SafeUser } from "@/db/schema";
import { SakerList } from "../List";
import { frist, seedParter, tomDb } from "@/test/db";
import { lagRequestInfo } from "@/test/request-info";

const db = await vi.hoisted(async () => (await import("@/test/db")).lagTestDb());
vi.mock("@/db", () => ({ getDb: async () => db }));

async function visSide(url: string, user: SafeUser | null) {
  render(await SakerList(lagRequestInfo(url, { db, user })));
}

async function meldInnSak(title: string, status: "open" | "closed" = "open") {
  const { leietaker, utleier } = await seedParter(db);
  await db.insert(cases).values({
    title,
    description: "Det drypper fra røret under vasken.",
    category: "pipes",
    priority: "high",
    deadline: frist,
    status,
    tenantId: leietaker.id,
    landlordId: utleier.id,
  });
  return { leietaker, utleier };
}

describe("/saker", () => {
  beforeEach(() => tomDb(db));

  it("ber om innlogging når ingen er logget inn", async () => {
    await visSide("http://localhost/saker", null);

    expect(screen.getByText("Ikke logget inn")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Saker" })).not.toBeInTheDocument();
  });

  it("leietakeren finner igjen saken sin i lista", async () => {
    const { leietaker } = await meldInnSak("Vannlekkasje under kjøkkenvasken");

    await visSide("http://localhost/saker", leietaker);

    expect(screen.getByRole("heading", { name: "Saker" })).toBeInTheDocument();
    expect(screen.getByText("Sakene du har meldt inn (Kari Nordmann)")).toBeInTheDocument();
    // «Åpen» står også i filteret.
    const rad = screen
      .getByRole("link", { name: "Vannlekkasje under kjøkkenvasken" })
      .closest("tr");
    expect(rad).toHaveTextContent("Rør");
    expect(rad).toHaveTextContent("Åpen");
    expect(rad).toHaveTextContent("1.12.2026");
    expect(screen.queryByRole("columnheader", { name: "Leietaker" })).not.toBeInTheDocument();
  });

  it("utleieren ser den samme saken, med hvem som meldte den inn", async () => {
    const { utleier } = await meldInnSak("Vannlekkasje under kjøkkenvasken");

    await visSide("http://localhost/saker", utleier);

    expect(screen.getByText("Saker sendt til deg (Ola Utleier)")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Leietaker" })).toBeInTheDocument();
    expect(screen.getByText("Kari Nordmann")).toBeInTheDocument();
  });

  it("filteret i adressen gjelder, og Nullstill tar det bort", async () => {
    const { leietaker } = await meldInnSak("Vannlekkasje under kjøkkenvasken");

    await visSide("http://localhost/saker?status=closed", leietaker);

    expect(screen.getByLabelText("Status")).toHaveDisplayValue("Lukket");
    expect(screen.getByText("Ingen saker passer filteret.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nullstill" })).toHaveAttribute("href", "/saker");
  });

  it("uten saker sier lista fra om det", async () => {
    const { leietaker } = await seedParter(db);

    await visSide("http://localhost/saker", leietaker);

    expect(screen.getByText("Ingenting er meldt inn ennå.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Nullstill" })).not.toBeInTheDocument();
  });
});
