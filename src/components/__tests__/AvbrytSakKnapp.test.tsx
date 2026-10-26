// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvbrytSakKnapp } from "../AvbrytSakKnapp";
import { avbrytSak } from "@/actions/saker";

vi.mock("@/actions/saker", () => ({ avbrytSak: vi.fn() }));
const avbrytSakMock = vi.mocked(avbrytSak);
// happy-dom har ingen confirm-dialog.
const confirmMock = vi.fn<() => boolean>();

describe("AvbrytSakKnapp", () => {
  beforeEach(() => {
    avbrytSakMock.mockReset();
    vi.stubGlobal("confirm", confirmMock.mockReset());
  });
  afterEach(() => vi.unstubAllGlobals());

  it("spør først, og avbryter saken ved ja", async () => {
    confirmMock.mockReturnValue(true);
    avbrytSakMock.mockResolvedValue({ ok: true });
    const bruker = userEvent.setup();
    render(<AvbrytSakKnapp sakId="sak-1" />);

    await bruker.click(screen.getByRole("button", { name: "Avbryt saken" }));

    expect(confirmMock).toHaveBeenCalledWith("Vil du avbryte saken? Den blir lukket.");
    expect(avbrytSakMock).toHaveBeenCalledWith("sak-1");
  });

  it("gjør ingenting ved nei", async () => {
    confirmMock.mockReturnValue(false);
    const bruker = userEvent.setup();
    render(<AvbrytSakKnapp sakId="sak-1" />);

    await bruker.click(screen.getByRole("button", { name: "Avbryt saken" }));

    expect(avbrytSakMock).not.toHaveBeenCalled();
  });

  it("viser feilen fra serveren", async () => {
    confirmMock.mockReturnValue(true);
    avbrytSakMock.mockResolvedValue({ ok: false, error: "Bare en åpen sak kan avbrytes" });
    const bruker = userEvent.setup();
    render(<AvbrytSakKnapp sakId="sak-1" />);

    await bruker.click(screen.getByRole("button", { name: "Avbryt saken" }));

    expect(screen.getByText("Bare en åpen sak kan avbrytes")).toBeInTheDocument();
  });
});
