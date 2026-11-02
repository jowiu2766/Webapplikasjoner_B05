"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
  adresseDTOSchema,
  formaterAdresse,
  type AdresseDTO,
} from "@/adresser/adresseSchema";

const forslagSchema = z.object({ data: z.array(adresseDTOSchema) });
const FEILMELDING = "Adressesøket svarer ikke. Skriv adressen selv.";

export function AdresseSok({ startverdi = "" }: { startverdi?: string }) {
  const [tekst, setTekst] = useState(startverdi);
  const [valgt, setValgt] = useState(startverdi);
  const [forslag, setForslag] = useState<AdresseDTO[]>([]);
  const [soker, setSoker] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  useEffect(() => {
    if (tekst.trim().length < 2 || tekst === valgt) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSoker(true);
      try {
        const res = await fetch(
          `/api/adresser?sok=${encodeURIComponent(tekst.trim())}`,
          { signal: controller.signal },
        );
        const svar = res.ok ? forslagSchema.safeParse(await res.json()) : null;
        if (!svar?.success) {
          setFeil(FEILMELDING);
          return;
        }
        setForslag(svar.data.data);
      } catch {
        if (!controller.signal.aborted) setFeil(FEILMELDING);
      } finally {
        if (!controller.signal.aborted) setSoker(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [tekst, valgt]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTekst(e.target.value);
    setValgt("");
    setForslag([]);
    setFeil(null);
  }

  function velg(adresse: AdresseDTO) {
    const valgtTekst = formaterAdresse(adresse);
    setTekst(valgtTekst);
    setValgt(valgtTekst);
    setForslag([]);
  }

  return (
    <div>
      <label
        htmlFor="address"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Adresse
      </label>
      <input
        id="address"
        name="address"
        type="text"
        required
        autoComplete="off"
        value={tekst}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Gateadresse, f.eks. Remmen 12"
      />
      {soker && <p className="mt-1 text-xs text-gray-500">Søker...</p>}
      {feil && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {feil}
        </p>
      )}
      {forslag.length > 0 && (
        <ul className="mt-1 divide-y divide-gray-100 rounded-md border border-gray-200 bg-white">
          {forslag.map((adresse) => {
            const adresseTekst = formaterAdresse(adresse);
            return (
              <li key={adresseTekst}>
                <button
                  type="button"
                  onClick={() => velg(adresse)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {adresseTekst}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-1 text-xs text-gray-500">Adressesøk: Kartverket</p>
    </div>
  );
}
