import { describe, it, expect } from "vitest";
import { parseSakFilter } from "../sak-filter";

describe("parseSakFilter", () => {
  it("leser status og prioritet fra adressen", () => {
    const filter = parseSakFilter(
      new URLSearchParams("status=open&prioritet=high")
    );

    expect(filter).toEqual({ status: "open", prioritet: "high" });
  });

  it("gir tomt filter når adressen ikke har noen", () => {
    expect(parseSakFilter(new URLSearchParams(""))).toEqual({});
  });
  it("«Alle» i skjemaet sender tom verdi, som betyr ingen filter", () => {
    expect(parseSakFilter(new URLSearchParams("status=&prioritet="))).toEqual(
      {}
    );
  });

  it("ignorerer verdier som ikke finnes i lista", () => {
    expect(parseSakFilter(new URLSearchParams("status=hacked"))).toEqual({});
  });
});
