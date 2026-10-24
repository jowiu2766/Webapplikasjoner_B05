import { describe, it, expect } from "vitest";
import { setCommonHeaders } from "../headers";
import { lagRequestInfo } from "@/test/request-info";

describe("setCommonHeaders", () => {
  it("setter sikkerhetsheadere, med nonce fra forespørselen i CSP-en", async () => {
    const info = lagRequestInfo("http://localhost/");

    await setCommonHeaders()(info);

    const headers = info.response.headers;
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(headers.get("Content-Security-Policy")).toContain("'nonce-test-nonce'");
    expect(headers.get("Content-Security-Policy")).toContain("object-src 'none'");
  });
});
