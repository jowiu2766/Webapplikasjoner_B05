import { caseCategories, CaseCategory, CaseStatus } from "./enums";

// Tittel
export function validateTitle(text: string) {
  if (text.trim() === "") {
    return { ok: false, error: "Tittel kan ikke være tom" };
  }
  if (text.length > 200) {
    return { ok: false, error: "Tittel kan ha maks 200 tegn" };
  }
  return { ok: true };
}

// Kategori
export function validateCategory(text: string) {
  if (!Object.values(caseCategories).includes(text as CaseCategory)) {
    return {
      ok: false,
      error: "Ugyldig kategori valgt",
    };
  }
  return { ok: true };
}

// Status
export function validateStatus(caseStatuses: CaseStatus) {
  if (!Object.values(caseStatuses)) {
    return {
      ok: false,
      error: "Ugyldig status valgt",
    };
  }
  return { ok: true };
}

// Deadline
export function validateDeadline(deadline: Date | string) {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  if (!deadline) {
    return { ok: false, error: "Deadline kan ikke være tom eller ugyldig" };
  }
  if (today > deadlineDate) {
    return {
      ok: false,
      error: "Deadline kan ikke være satt i fortid",
    };
  }
  return { ok: true };
}

// Beskrivelse
export function validateDescription(text: string) {
  if (text.trim() === "") {
    return { ok: false, error: "Beskrivelsen kan ikke være tom" };
  }
  if (text.length > 500) {
    return { ok: false, error: "Beskrivelsen kan ha maks 500 tegn" };
  }
  return { ok: true };
}
