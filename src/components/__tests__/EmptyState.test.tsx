// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("viser tittel og forklaring", () => {
    render(<EmptyState title="Ingen saker">Ingenting er meldt inn ennå.</EmptyState>);

    expect(screen.getByText("Ingen saker")).toBeInTheDocument();
    expect(screen.getByText("Ingenting er meldt inn ennå.")).toBeInTheDocument();
  });

  it("klarer seg uten forklaring", () => {
    const { container } = render(<EmptyState title="Ingen meldinger ennå" />);

    expect(screen.getByText("Ingen meldinger ennå")).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });
});
