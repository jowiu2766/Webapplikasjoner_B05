"use client";

import { useState } from "react";
import { oppdaterStatus } from "@/actions/saker";
import { statusLabels, type CaseStatus } from "@/lib/enums";

export function StatusVelger({ sakId, valg }: { sakId: string; valg: CaseStatus[] }) {
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, setLagrer] = useState(false);

  if (valg.length === 0) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const status = String(new FormData(e.currentTarget).get("status"));
    setLagrer(true);
    setFeil(null);
    const resultat = await oppdaterStatus(sakId, status);
    setLagrer(false);
    if (!resultat.ok) setFeil(resultat.error);
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-3 text-sm">
      <label className="flex flex-col">
        Ny status
        <select name="status" className="mt-1 rounded-md border border-slate-300 px-3 py-2">
          {valg.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={lagrer}
        className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {lagrer ? "Lagrer..." : "Oppdater status"}
      </button>
      {feil && <p className="w-full text-red-700">{feil}</p>}
    </form>
  );
}
