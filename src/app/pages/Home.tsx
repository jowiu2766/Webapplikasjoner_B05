import type { ReactNode } from "react";

// Rollevalget er midlertidig til innlogging er på plass.
export function Home() {
  return (
    <main className="mx-auto max-w-4xl p-8 font-sans">
      <h1 className="text-3xl font-bold">Fiksa</h1>
      <p className="mt-2 max-w-prose text-lg text-slate-600">
        Fiksa samler dialogen mellom leietaker og utleier på ett sted. Meld inn
        det som må fikses, følg saken og snakk sammen om den til den er løst.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/saker/ny"
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Opprett sak
        </a>
        <a
          href="/saker?rolle=tenant"
          className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50"
        >
          Mine saker
        </a>
        <a
          href="/saker?rolle=landlord"
          className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-50"
        >
          Saker sendt til meg
        </a>
      </div>

      <h2 className="mt-12 text-xl font-semibold">Slik virker det</h2>
      <ol className="mt-4 grid gap-4 md:grid-cols-3">
        <Steg nr={1} tittel="Meld inn">
          Leietaker beskriver problemet, velger kategori og hvor mye det haster.
        </Steg>
        <Steg nr={2} tittel="Følg opp">
          Utleier ser saken i lista si og flytter den fram: under arbeid, venter, lukket.
        </Steg>
        <Steg nr={3} tittel="Snakk sammen">
          Begge skriver meldinger på saken, så alt om den ligger på ett sted.
        </Steg>
      </ol>
    </main>
  );
}

function Steg({ nr, tittel, children }: { nr: number; tittel: string; children: ReactNode }) {
  return (
    <li className="rounded-lg border border-slate-200 p-4">
      <p className="text-sm text-slate-500">Steg {nr}</p>
      <p className="mt-1 font-medium">{tittel}</p>
      <p className="mt-1 text-sm text-slate-600">{children}</p>
    </li>
  );
}
