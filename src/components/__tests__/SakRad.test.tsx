// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SakRad } from "../SakRad";

const kari = {
  id: "u1",
  name: "Kari Nordmann",
  email: "kari@example.com",
  emailVerified: false,
  passwordHash: null,
  role: "tenant" as const,
  image: null,
  createdAt: new Date("2026-10-01T12:00:00Z"),
  updatedAt: new Date("2026-10-01T12:00:00Z"),
  lastLoginAt: null,
  isActive: true,
  address: null,
};

const sak = {
  id: "sak-1",
  title: "Vannlekkasje under kjøkkenvasken",
  description: "Det drypper.",
  category: "pipes" as const,
  priority: "high" as const,
  status: "open" as const,
  deadline: new Date("2026-10-14T12:00:00Z"),
  tenantId: "u1",
  landlordId: "u2",
  createdAt: new Date("2026-10-07T12:00:00Z"),
  updatedAt: new Date("2026-10-07T12:00:00Z"),
  tenant: kari,
};

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
    expect(screen.getByText("14.10.2026")).toBeInTheDocument();
    expect(screen.getByText("7.10.2026")).toBeInTheDocument();
    expect(screen.queryByText("Kari Nordmann")).not.toBeInTheDocument();
  });

  it("viser leietakeren når utleier ser lista", () => {
    renderRad(true);

    expect(screen.getByText("Kari Nordmann")).toBeInTheDocument();
  });
});
