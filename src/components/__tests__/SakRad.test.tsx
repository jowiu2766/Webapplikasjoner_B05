// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Case, User } from "@/db/schema";
import { SakRad } from "../SakRad";

const dato = new Date("2026-10-07T12:00:00Z");

const tenant: User = {
  id: "u1",
  name: "Kari Nordmann",
  email: "kari@example.com",
  emailVerified: false,
  passwordHash: "testHash",
  role: "Tenant",
  image: null,
  createdAt: dato,
  updatedAt: dato,
  lastLoginAt: null,
  isActive: true,
  address: "Testveien 1",
};

const sak: Case & { tenant: User } = {
  id: "sak-1",
  title: "Vannlekkasje under kjøkkenvasken",
  description: "Det drypper.",
  category: "pipes",
  priority: "high",
  deadline: new Date("2026-10-14T12:00:00Z"),
  status: "open",
  fileKey: null,
  tenantId: "u1",
  landlordId: "u2",
  createdAt: dato,
  updatedAt: dato,
  tenant,
};

// En rad må stå i en tabell.
function renderRad(visLeietaker: boolean) {
  return render(
    <table>
      <tbody>
        <SakRad sak={sak} visLeietaker={visLeietaker} />
      </tbody>
    </table>
  );
}

describe("SakRad", () => {
  it("viser saken på norsk og lenker til detaljsida", () => {
    renderRad(false);

    expect(screen.getByRole("link", { name: "Vannlekkasje under kjøkkenvasken" })).toHaveAttribute(
      "href",
      "/saker/sak-1"
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
