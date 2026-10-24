"use client";

import { useState } from "react";
import { sendMelding } from "@/actions/saker";

// rwsdk rendrer sida på nytt etter action-en, så meldinga dukker opp uten reload
export function MeldingForm({ sakId }: { sakId: string }) {
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [sender, setSender] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSender(true);
    setFeil(null);
    const resultat = await sendMelding(sakId, tekst);
    setSender(false);
    if (!resultat.ok) {
      setFeil(resultat.error);
      return;
    }
    setTekst("");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2">
      <label htmlFor="melding" className="text-sm font-medium">
        Ny melding
      </label>
      <textarea
        id="melding"
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        rows={3}
        maxLength={2000}
        className="rounded-md border border-slate-300 px-3 py-2"
      />
      {feil && <p className="text-sm text-red-700">{feil}</p>}
      <button
        type="submit"
        disabled={sender}
        className="self-start rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {sender ? "Sender..." : "Send"}
      </button>
    </form>
  );
}
