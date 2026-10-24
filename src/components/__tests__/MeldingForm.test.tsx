// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeldingForm } from "../MeldingForm";
import { sendMelding } from "@/actions/saker";

// server action-en mockes, den trenger databasen
vi.mock("@/actions/saker", () => ({ sendMelding: vi.fn() }));
const sendMeldingMock = vi.mocked(sendMelding);

describe("MeldingForm", () => {
  beforeEach(() => sendMeldingMock.mockReset());

  it("sender teksten til server action-en og tømmer feltet", async () => {
    sendMeldingMock.mockResolvedValue({ ok: true });
    const bruker = userEvent.setup();
    render(<MeldingForm sakId="sak-1" />);

    await bruker.type(screen.getByLabelText("Ny melding"), "Hei");
    await bruker.click(screen.getByRole("button", { name: "Send" }));

    expect(sendMeldingMock).toHaveBeenCalledWith("sak-1", "Hei");
    expect(screen.getByLabelText("Ny melding")).toHaveValue("");
  });

  it("viser feilen fra serveren og beholder teksten", async () => {
    sendMeldingMock.mockResolvedValue({ ok: false, error: "Ingen tilgang til saken" });
    const bruker = userEvent.setup();
    render(<MeldingForm sakId="sak-1" />);

    await bruker.type(screen.getByLabelText("Ny melding"), "Hei");
    await bruker.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.getByText("Ingen tilgang til saken")).toBeInTheDocument();
    expect(screen.getByLabelText("Ny melding")).toHaveValue("Hei");
  });
});
