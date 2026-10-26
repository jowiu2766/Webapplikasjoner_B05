// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SakRad } from "../SakRad";

const sak = {
  id: "sak-1",
  title: "Vannlekkasje under kjøkkenvasken",
  description: "Det drypper.",
  category: "pipes",
  priority: "high",
  status: "open",
  tenantId: 1,
  landlordId: 2,
  createdAt: new Date("2026-10-07T12:00:00Z"),
  tenant: { id: 1, name: "Kari Nordmann", email: "kari@example.com", role: "tenant" },
} as const;

// En rad må stå i en tabell.
function renderRad(visLeietaker: boolean) {
  return render(
    <table>
      <tbody>
        <SakRad sak={sak} rolle="tenant" visLeietaker={visLeietaker} />
      </tbody>
    </table>
  );
}

describe("SakRad", () => {
  it("viser saken på norsk og lenker til detaljsida", () => {
    renderRad(false);

    expect(screen.getByRole("link", { name: "Vannlekkasje under kjøkkenvasken" })).toHaveAttribute(
      "href",
      "/saker/sak-1?rolle=tenant"
    );
    expect(screen.getByText("Rør")).toBeInTheDocument();
    expect(screen.getByText("Høy")).toBeInTheDocument();
    expect(screen.getByText("Åpen")).toBeInTheDocument();
    expect(screen.getByText("7.10.2026")).toBeInTheDocument();
    expect(screen.queryByText("Kari Nordmann")).not.toBeInTheDocument();
  });

  it("viser leietakeren når utleier ser lista", () => {
    renderRad(true);

    expect(screen.getByText("Kari Nordmann")).toBeInTheDocument();
  });
});
