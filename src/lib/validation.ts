export function validateDescription(text: string) {
  if (text.trim() === "") {
    return { ok: false, error: "Beskrivelsen kan ikke være tom" };
  }
  if (text.length > 500) {
    return { ok: false, error: "Beskrivelsen kan ha maks 500 tegn" };
  }
  return { ok: true };
}
