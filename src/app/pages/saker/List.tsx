import type { RequestInfo } from "rwsdk/worker";
import { midlertidigBruker } from "@/db/queries/bruker";
import { listSaker } from "@/db/queries/saker";
import { parseSakFilter } from "@/lib/sak-filter";
import {
  casePriorities,
  caseStatuses,
  priorityLabels,
  statusLabels,
} from "@/lib/enums";
import { EmptyState } from "@/components/EmptyState";
import { SakRad } from "@/components/SakRad";

// sakslista, filteret er et vanlig skjema med method=get
export async function SakerList({ request }: RequestInfo) {
  const url = new URL(request.url);
  const filter = parseSakFilter(url.searchParams);
  const harFilter = filter.status !== undefined || filter.prioritet !== undefined;

  const bruker = await midlertidigBruker(request);
  if (!bruker) {
    return (
      <main className="mx-auto max-w-4xl p-8 font-sans">
        <EmptyState title="Fant ingen bruker">Kjør npm run seed først.</EmptyState>
      </main>
    );
  }

  const erUtleier = bruker.role === "landlord";
  const rolle = bruker.role;
  const saker = await listSaker(bruker, filter);

  const selectClass = "mt-1 rounded-md border border-slate-300 px-3 py-2";

  return (
    <main className="mx-auto max-w-4xl p-8 font-sans">
      <h1 className="text-3xl font-bold">Saker</h1>
      <p className="mt-2 text-slate-600">
        {erUtleier ? "Saker sendt til deg" : "Sakene du har meldt inn"} ({bruker.name})
      </p>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3 text-sm">
        {/* rollen blir med når skjemaet sendes */}
        <input type="hidden" name="rolle" value={rolle} />

        <label className="flex flex-col">
          Status
          <select name="status" defaultValue={filter.status ?? ""} className={selectClass}>
            <option value="">Alle</option>
            {caseStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          Prioritet
          <select name="prioritet" defaultValue={filter.prioritet ?? ""} className={selectClass}>
            <option value="">Alle</option>
            {casePriorities.map((prioritet) => (
              <option key={prioritet} value={prioritet}>
                {priorityLabels[prioritet]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Filtrer
        </button>

        {harFilter && (
          <a className="py-2 underline" href={`/saker?rolle=${rolle}`}>
            Nullstill
          </a>
        )}
      </form>

      {saker.length === 0 ? (
        <EmptyState title="Ingen saker">
          {harFilter ? "Ingen saker passer filteret." : "Ingenting er meldt inn ennå."}
        </EmptyState>
      ) : (
        <table className="mt-6 block w-full text-left text-sm md:table">
          <thead className="hidden md:table-header-group">
            <tr className="border-b text-slate-500">
              <th className="py-2 pr-4 font-medium">Sak</th>
              <th className="py-2 pr-4 font-medium">Kategori</th>
              <th className="py-2 pr-4 font-medium">Prioritet</th>
              <th className="py-2 pr-4 font-medium">Tidsfrist</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              {erUtleier && <th className="py-2 pr-4 font-medium">Leietaker</th>}
              <th className="py-2 pr-4 font-medium">Opprettet</th>
            </tr>
          </thead>
          <tbody className="block space-y-3 md:table-row-group md:space-y-0">
            {saker.map((sak) => (
              <SakRad key={sak.id} sak={sak} rolle={rolle} visLeietaker={erUtleier} />
            ))}
          </tbody>
        </table>
      )}
      <a
        href="/saker/ny"
        className="mt-8 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
      >
        Opprett sak
      </a>
    </main>
  );
}
