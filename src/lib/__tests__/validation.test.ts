import { describe, it, expect } from "vitest";
import {
  validateCategory,
  validateDeadline,
  validateDescription,
  validateStatus,
  validateTitle,
} from "@/lib/validation";

// Title
describe("validateTitle", () => {
  it("godtar en vanlig tittel", () => {
    expect(validateTitle("Ødelagt lyspære")).toEqual({ ok: true });
  });

  it("avviser tom tittel", () => {
    expect(validateTitle("").ok).toBe(false);
  });

  it("avviser tittel med bare mellomrom", () => {
    expect(validateTitle("   ").ok).toBe(false);
  });

  it("godtar tittel på nøyaktig 200 tegn", () => {
    expect(validateTitle("a".repeat(200)).ok).toBe(true);
  });

  it("avviser for lang tittel", () => {
    expect(validateTitle("a".repeat(201)).ok).toBe(false);
  });
});

// Category
describe("validateCategory", () => {
  it("godtar en gyldig kategori", () => {
    expect(validateCategory("electricity").ok).toBe(true);
  });

  it("avviser manglende kategori", () => {
    expect(validateCategory("choose").ok).toBe(false);
  });
});

// Status
describe("validateStatus", () => {
  it("godtar en gyldig status", () => {
    expect(validateStatus("open").ok).toBe(true);
  });
});

// Deadline
describe("validateDeadline", () => {
  it("godtar en gyldig fremtidig frist", () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    expect(validateDeadline(deadline).ok).toEqual(true);
  });

  it("avviser en frist i fortiden", () => {
    expect(validateDeadline("2020-01-01").ok).toEqual(false);
  });
});

// Description
describe("validateDescription", () => {
  it("godtar en vanlig beskrivelse", () => {
    expect(validateDescription("Vannlekkasje under kjøkkenvasken")).toEqual({
      ok: true,
    });
  });

  it("avviser en tom beskrivelse", () => {
    expect(validateDescription("").ok).toBe(false);
  });

  it("avviser beskrivelse med bare mellomrom", () => {
    expect(validateDescription("   ").ok).toBe(false);
  });

  it("avviser en for lang beskrivelse", () => {
    expect(validateDescription("a".repeat(501)).ok).toBe(false);
  });

  it("godtar en beskrivelse på nøyaktig 500 tegn", () => {
    expect(validateDescription("a".repeat(500)).ok).toBe(true);
  });

  it("avviser en beskrivelse på 500 tegn", () => {
    expect(validateDescription("a".repeat(501)).ok).toBe(false);
  });
});
