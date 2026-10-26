// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { db } from "@/db";
import { cases } from "@/db/schema";
import { SakerList } from "../List";
import { nySak, seedParter, tomDb } from "@/test/db";
import { lagRequestInfo } from "@/test/request-info";

vi.mock("@/db", async () => ({ db: (await import("@/test/db")).lagTestDb() }));

async function visSide(url: string) {
  render(await SakerList(lagRequestInfo(url)));
}

async function meldInnSak(title: string, status: "open" | "closed" = "open") {
  const { leietaker, utleier } = await seedParter(db);
  await db.insert(cases).values(nySak(leietaker.id, utleier.id, { title, status }));
}

describe("/saker", () => {
  beforeEach(() => tomDb(db));

  it("ber om seed når det ikke finnes brukere", async () => {
    await visSide("http://localhost/saker");

    expect(screen.getByText("Fant ingen bruker")).toBeInTheDocument();
  });

  it("leietakeren finner igjen saken sin i lista", async () => {
    await meldInnSak("Vannlekkasje under kjøkkenvasken");

    await visSide("http://localhost/saker?rolle=tenant");

    expect(screen.getByRole("heading", { name: "Saker" })).toBeInTheDocument();
    expect(screen.getByText("Sakene du har meldt inn (Kari Nordmann)")).toBeInTheDocument();
    // «Åpen» står også i filteret.
    const rad = screen
      .getByRole("link", { name: "Vannlekkasje under kjøkkenvasken" })
      .closest("tr");
    expect(rad).toHaveTextContent("Rør");
    expect(rad).toHaveTextContent("Åpen");
    expect(screen.queryByRole("columnheader", { name: "Leietaker" })).not.toBeInTheDocument();
  });

  it("utleieren ser den samme saken, med hvem som meldte den inn", async () => {
    await meldInnSak("Vannlekkasje under kjøkkenvasken");

    await visSide("http://localhost/saker?rolle=landlord");

    expect(screen.getByText("Saker sendt til deg (Ola Utleier)")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Leietaker" })).toBeInTheDocument();
    expect(screen.getByText("Kari Nordmann")).toBeInTheDocument();
  });

  it("filteret i adressen gjelder, og Nullstill tar det bort", async () => {
    await meldInnSak("Vannlekkasje under kjøkkenvasken");

    await visSide("http://localhost/saker?rolle=tenant&status=closed");

    expect(screen.getByLabelText("Status")).toHaveDisplayValue("Lukket");
    expect(screen.getByText("Ingen saker passer filteret.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nullstill" })).toHaveAttribute(
      "href",
      "/saker?rolle=tenant"
    );
  });

  it("uten saker sier lista fra om det", async () => {
    await seedParter(db);

    await visSide("http://localhost/saker?rolle=tenant");

    expect(screen.getByText("Ingenting er meldt inn ennå.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Nullstill" })).not.toBeInTheDocument();
  });
});
