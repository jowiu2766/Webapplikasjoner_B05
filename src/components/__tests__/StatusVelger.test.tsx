// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusVelger } from "../StatusVelger";
import { oppdaterStatus } from "@/actions/saker";

vi.mock("@/actions/saker", () => ({ oppdaterStatus: vi.fn() }));
const oppdaterStatusMock = vi.mocked(oppdaterStatus);

describe("StatusVelger", () => {
  beforeEach(() => oppdaterStatusMock.mockReset());

  it("sender det valgte steget til server action-en", async () => {
    oppdaterStatusMock.mockResolvedValue({ ok: true });
    const bruker = userEvent.setup();
    render(<StatusVelger sakId="sak-1" valg={["in_progress"]} />);

    expect(screen.getByLabelText("Ny status")).toHaveDisplayValue("Under arbeid");
    await bruker.click(screen.getByRole("button", { name: "Oppdater status" }));

    expect(oppdaterStatusMock).toHaveBeenCalledWith("sak-1", "in_progress");
  });

  it("viser feilen fra serveren", async () => {
    oppdaterStatusMock.mockResolvedValue({ ok: false, error: "Den overgangen er ikke lov" });
    const bruker = userEvent.setup();
    render(<StatusVelger sakId="sak-1" valg={["in_progress"]} />);

    await bruker.click(screen.getByRole("button", { name: "Oppdater status" }));

    expect(screen.getByText("Den overgangen er ikke lov")).toBeInTheDocument();
  });

  it("viser ingenting når det ikke finnes lovlige steg", () => {
    const { container } = render(<StatusVelger sakId="sak-1" valg={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
