"use client";

import { useState } from "react";
import { avbrytSak } from "@/actions/saker";

export function AvbrytSakKnapp({ sakId }: { sakId: string }) {
  const [feil, setFeil] = useState<string | null>(null);
  const [jobber, setJobber] = useState(false);

  async function onClick() {
    if (!confirm("Vil du avbryte saken? Den blir lukket.")) return;
    setJobber(true);
    setFeil(null);
    const resultat = await avbrytSak(sakId);
    setJobber(false);
    if (!resultat.ok) setFeil(resultat.error);
  }

  return (
    <div className="mt-4 text-sm">
      <button
        type="button"
        onClick={onClick}
        disabled={jobber}
        className="rounded-md border border-red-700 px-4 py-2 text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {jobber ? "Avbryter..." : "Avbryt saken"}
      </button>
      {feil && <p className="mt-2 text-red-700">{feil}</p>}
    </div>
  );
}
