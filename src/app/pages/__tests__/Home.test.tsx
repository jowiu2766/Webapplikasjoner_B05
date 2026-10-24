// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Home } from "../Home";

describe("Home", () => {
  it("viser Fiksa og veien til ny sak", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Fiksa" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Opprett sak" })).toHaveAttribute("href", "/saker/ny");
  });
});
